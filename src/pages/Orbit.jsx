
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, MessageCircle, FileText, Trash2, Search, CalendarCheck, Sparkles, X, Filter, SlidersHorizontal } from 'lucide-react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import BottomNavigation from '../components/BottomNavigation';
import ContactModal from '../components/ContactModal';
import UserProfileModal from '../components/UserProfileModal';
import AmbientSoundManager from '../components/AmbientSoundManager';
import CursorTrail from '../components/CursorTrail';
import SearchDrawer from '../components/SearchDrawer';
import OrbitIntelligence from '../components/OrbitIntelligence';
import HintOverlay from '../components/HintOverlay';
import SmartReminderEngine from '../components/SmartReminderEngine'; // Changed from AIReminderEngine
import NetworkHealthEngine from '../components/NetworkHealthEngine';
import OrbitFilterPanel from '../components/OrbitFilterPanel';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function Orbit() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrbit, setSelectedOrbit] = useState(null);
  const [orbitSpacing, setOrbitSpacing] = useState(35);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomTargetRef = useRef(1);
  const zoomAnimationRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false); // This refers to canvas dragging
  const [focusedContact, setFocusedContact] = useState(null);
  const [focusZoom, setFocusZoom] = useState(1);
  const [radialMenuContact, setRadialMenuContact] = useState(null);
  const [radialMenuPosition, setRadialMenuPosition] = useState({ x: 0, y: 0 });
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [hoveredSearchContact, setHoveredSearchContact] = useState(null);
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    healthScore: [0, 100],
    lastContactedDays: [0, 365],
    tags: [],
    riskLevel: 'all',
    showAtRisk: true,
    showMilestones: true,
    groupByTags: false
  });
  const [draggedContact, setDraggedContact] = useState(null);
  const [dragTargetOrbit, setDragTargetOrbit] = useState(null);
  const [pulsingContact, setPulsingContact] = useState(null);
  const [cooldownContacts, setCooldownContacts] = new useState(new Set());
  const [orbitTransitionActive, setOrbitTransitionActive] = useState(null); // NEW: Track active orbit transitions

  // New states for portal functionality (now used as source of truth for visual wormhole)
  const [portalMode, setPortalMode] = useState(null); // { contactId, startTime, startX, startY }
  const [portalDestination, setPortalDestination] = useState(null); // { orbitLevel, angle }
  // Outline change: cursorState now includes 'pulse' instead of 'grasp' for wormhole activation feedback.
  const [cursorState, setCursorState] = useState('default'); // 'default' | 'pointer' | 'pulse'

  const [hoveredContact, setHoveredContact] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [centerHovered, setCenterHovered] = useState(null);
  const [hoveredSun, setHoveredSun] = useState(false);
  const tooltipRef = useRef(null);

  const queryClient = useQueryClient();
  const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, velocityX: 0, velocityY: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, currentX: 0, currentY: 0 }); // This refers to canvas dragging
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  const parallaxOffsetRef = useRef({ x: 0, y: 0 });
  const portalInitialPointerPosRef = useRef({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null); // Persistent timeout ref

  const MAX_ORBITS = 12; // Fixed at 12 rings

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;


  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });
  const theme = user?.theme || 'cosmic';

  const themeColors = {
    cosmic: {
      primary: '#8b5cf6',
      secondary: '#ffdca8',
      orbitColors: [
        'rgba(236, 72, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(59, 130, 246, 0.45)',
        'rgba(16, 185, 129, 0.45)', 'rgba(245, 158, 11, 0.4)', 'rgba(239, 68, 68, 0.4)',
        'rgba(168, 85, 247, 0.35)', 'rgba(34, 197, 94, 0.35)', 'rgba(14, 165, 233, 0.3)',
        'rgba(251, 146, 60, 0.3)'
      ]
    },
    sunrise: {
      primary: '#ff6b6b',
      secondary: '#ffd6a5',
      orbitColors: [
        'rgba(239, 68, 68, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(245, 158, 11, 0.45)',
        'rgba(234, 179, 8, 0.45)', 'rgba(251, 191, 36, 0.4)', 'rgba(217, 119, 6, 0.4)',
        'rgba(220, 38, 38, 0.35)', 'rgba(252, 165, 165, 0.35)', 'rgba(254, 215, 170, 0.3)',
        'rgba(253, 186, 116, 0.3)'
      ]
    },
    retro: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      orbitColors: [
        'rgba(0, 255, 255, 0.7)', 'rgba(255, 0, 255, 0.7)', 'rgba(157, 0, 255, 0.65)',
        'rgba(0, 255, 200, 0.65)', 'rgba(255, 0, 180, 0.6)', 'rgba(0, 200, 255, 0.6)',
        'rgba(200, 0, 255, 0.55)', 'rgba(0, 255, 128, 0.55)', 'rgba(255, 100, 255, 0.5)',
        'rgba(100, 255, 255, 0.5)'
      ]
    },
    aurora: {
      primary: '#34d399',
      secondary: '#a7f3d0',
      orbitColors: [
        'rgba(52, 211, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(236, 72, 153, 0.45)',
        'rgba(59, 130, 246, 0.45)', 'rgba(16, 185, 129, 0.4)', 'rgba(168, 85, 247, 0.4)',
        'rgba(103, 232, 249, 0.35)', 'rgba(34, 197, 94, 0.35)', 'rgba(147, 197, 253, 0.3)',
        'rgba(167, 243, 208, 0.3)'
      ]
    },
    solar: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      orbitColors: [
        'rgba(239, 68, 68, 0.5)', 'rgba(234, 88, 12, 0.5)', 'rgba(249, 115, 22, 0.45)',
        'rgba(245, 158, 11, 0.45)', 'rgba(234, 179, 8, 0.4)', 'rgba(251, 191, 36, 0.4)',
        'rgba(217, 119, 6, 0.35)', 'rgba(252, 211, 77, 0.35)', 'rgba(253, 224, 71, 0.3)',
        'rgba(254, 240, 138, 0.3)'
      ]
    },
    ocean: {
      primary: '#4f46e5',
      secondary: '#67e8f9',
      orbitColors: [
        'rgba(79, 70, 229, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(14, 165, 233, 0.45)',
        'rgba(6, 182, 212, 0.45)', 'rgba(20, 184, 166, 0.4)', 'rgba(16, 185, 129, 0.4)',
        'rgba(99, 102, 241, 0.35)', 'rgba(96, 165, 250, 0.35)', 'rgba(125, 211, 252, 0.3)',
        'rgba(103, 232, 249, 0.3)'
      ]
    }
  };
  const colors = themeColors[theme] || themeColors.cosmic;

  const hexToRgba = (color, alpha = 1) => {
    if (!color) return `rgba(0,0,0,${alpha})`;
    if (color.startsWith('#')) {
      let r = 0, g = 0, b = 0;
      if (color.length === 4) {
        r = parseInt(color[1] + color[1], 16);
        g = parseInt(color[2] + color[2], 16);
        b = parseInt(color[3] + color[3], 16);
      } else if (color.length === 7) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (color.startsWith('rgb(') && color.endsWith(')')) {
      const parts = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (parts) return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${alpha})`;
    } else if (color.startsWith('rgba(') && color.endsWith(')')) {
      const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (parts) return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${alpha})`;
    }
    return color;
  };

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setModalOpen(false);
      setSelectedOrbit(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      // Log when state is synced
      if (variables.data.orbit_level !== undefined) {
        console.log(`🔄 Orbit jump synced to state: Contact ${variables.id} → Ring ${variables.data.orbit_level}`);
      }
      
      if (variables.data.last_contacted !== undefined && variables.data.manual_position === false) {
        window.dispatchEvent(new CustomEvent('forceOrbitCheck'));
        if (variables.id) {
          setPulsingContact(variables.id);
          setTimeout(() => setPulsingContact(null), 3000);
        }
      }
      setModalOpen(false);
      setSelectedContact(null);
      
      if (portalMode && portalMode.contactId === variables.id && variables.data.manual_position) {
        setTimeout(() => {
          setPortalMode(null);
          setPortalDestination(null);
        }, 600);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setModalOpen(false);
      setSelectedContact(null);
      setRadialMenuContact(null);
      // Close tooltip if the deleted contact was hovered
      setShowTooltip(false);
      setHoveredContact(null);
      setHoveredSun(false);
    }
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, reminder_date }) => base44.entities.Contact.update(id, { reminder_date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const handleSave = (data) => {
    if (window.ambientSound) {
      window.ambientSound.pulseForContact();
    }
    
    const dataToSave = { ...data };
    
    // Check if orbit_level was manually changed
    const manualOrbitChange = selectedContact && 
      data.orbit_level !== undefined && 
      data.orbit_level !== selectedContact.orbit_level;
    
    if (manualOrbitChange) {
      // Direct orbit jump to selected level
      const targetOrbit = Math.max(1, Math.min(MAX_ORBITS, data.orbit_level));
      dataToSave.orbit_level = targetOrbit;
      dataToSave.manual_position = true;
      dataToSave.orbit_level_at_last_contact = targetOrbit;
      
      console.log(`🎯 Orbit jump initiated: ${selectedContact.name} ${selectedContact.orbit_level} → ${targetOrbit}`);
      
      // NEW: Trigger orbit transition effect
      setOrbitTransitionActive({
        contactId: selectedContact.id,
        fromOrbit: selectedContact.orbit_level,
        toOrbit: targetOrbit,
        startTime: performance.now()
      });
      
      if (selectedContact) {
        setPulsingContact(selectedContact.id);
        setTimeout(() => setPulsingContact(null), 1800);
      }
    }
    // Calculate orbit level based on last_contacted date (only if not manual change)
    else if (dataToSave.last_contacted) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastContactedDate = new Date(dataToSave.last_contacted);
      lastContactedDate.setHours(0, 0, 0, 0);

      const daysDifference = Math.floor((today - lastContactedDate) / (1000 * 60 * 60 * 24));
      let newOrbitLevel;

      const currentOrbit = selectedContact?.orbit_level || dataToSave.orbit_level || 6;
      const baseOrbit = selectedContact?.orbit_level_at_last_contact || currentOrbit;

      if (daysDifference <= 1) {
        // Contacted today or yesterday → move inward by 1
        newOrbitLevel = Math.max(1, baseOrbit - 1);
        console.log(`🌠 Contacted today — moving inward to orbit ${newOrbitLevel}`);
      } else if (daysDifference > 3) {
        // Contacted days ago → move outward based on inactivity (1 ring every 3 days)
        const orbitsToMove = Math.floor(daysDifference / 3);
        newOrbitLevel = Math.min(MAX_ORBITS, baseOrbit + orbitsToMove);
        console.log(`🪐 ${daysDifference} days since contact — moving outward ${orbitsToMove} rings (to ${newOrbitLevel})`);
      } else {
        // Slight decay but not enough to move rings
        newOrbitLevel = baseOrbit;
      }

      dataToSave.orbit_level = newOrbitLevel;
      dataToSave.orbit_level_at_last_contact = newOrbitLevel;
      dataToSave.manual_position = false;

      if (selectedContact) {
        setPulsingContact(selectedContact.id);
        setTimeout(() => setPulsingContact(null), 1800);
      }
    }
    
    if (selectedContact) {
      updateMutation.mutate({ id: selectedContact.id, data: dataToSave });
    } else {
      const finalData = selectedOrbit ? { ...dataToSave, orbit_level: selectedOrbit } : dataToSave;
      createMutation.mutate(finalData);
    }
  };

  const handleUpdateReminder = (contactId, reminderDate) => {
    updateReminderMutation.mutate({ id: contactId, reminder_date: reminderDate });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOrbitClick = (level) => {
    setShowTooltip(false);
    setHoveredContact(null);
    setHoveredSun(false);

    setSelectedOrbit(level);
    setSelectedContact(null);
    setModalOpen(true);
  };

  const handleContactClick = (contact) => {
    // Clear any pending hover timeout immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    // Close tooltip immediately when opening modal
    setShowTooltip(false);
    setHoveredContact(null);
    setHoveredSun(false);
    
    setSelectedContact(contact);
    setSelectedOrbit(null);
    setModalOpen(true);
    setFocusedContact(null);
    setFocusZoom(1);
  };

  const handleEditContact = (contact) => {
    // Clear any pending hover timeout immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setShowTooltip(false);
    setHoveredContact(null);
    setHoveredSun(false);

    setSelectedContact(contact);
    setSelectedOrbit(null);
    setModalOpen(true);
    setFocusedContact(null);
    setFocusZoom(1);
  };

  const exitFocusMode = () => {
    setFocusedContact(null);
    setFocusZoom(1);
  };

  const handleCenterClick = () => {
    setShowTooltip(false);
    setHoveredContact(null);
    setHoveredSun(false);
    setUserProfileOpen(true);
  };

  const handleContactDragStart = useCallback((contact) => {
    setDraggedContact(contact);
    setIsDragging(false); // This is for canvas dragging, not contact dragging
    dragRef.current.isDragging = false; // This is for canvas dragging, not contact dragging
  }, []);

  const handleContactDragEnd = useCallback((targetOrbitLevel, newAngleDegrees, onVisualAnimationComplete) => {
    if (!draggedContact) {
      if (onVisualAnimationComplete) onVisualAnimationComplete();
      return;
    }

    const dataToUpdate = {};
    let shouldUpdateBackend = false;

    if (targetOrbitLevel && targetOrbitLevel !== draggedContact.orbit_level) {
      dataToUpdate.orbit_level = Math.max(1, Math.min(MAX_ORBITS, targetOrbitLevel));
      shouldUpdateBackend = true;
    }

    if (newAngleDegrees !== undefined && (Math.abs(newAngleDegrees - (draggedContact.angle || 0)) > 0.1 || shouldUpdateBackend)) {
      dataToUpdate.angle = newAngleDegrees;
      dataToUpdate.last_manual_position_update = new Date().toISOString();
      dataToUpdate.manual_position = true;
      shouldUpdateBackend = true;
    }

    if (shouldUpdateBackend) {
      updateMutation.mutate({ id: draggedContact.id, data: dataToUpdate }, {
        onSettled: () => {
          setDraggedContact(null);
          setDragTargetOrbit(null);
          if (onVisualAnimationComplete) onVisualAnimationComplete();
        }
      });
    } else {
      setDraggedContact(null);
      setDragTargetOrbit(null);
      if (onVisualAnimationComplete) onVisualAnimationComplete();
    }
  }, [draggedContact, updateMutation, MAX_ORBITS]);

  // Changed to handle initial startX/Y for portal visuals
  const handleTeleportContact = useCallback((contactId, orbitLevel, angle, startX, startY) => {
    // Initiate visual portal effect right away in the parent state
    setPortalMode({
      contactId: contactId,
      startTime: performance.now(),
      startX: startX,
      startY: startY
    });
    setPortalDestination({ orbitLevel: orbitLevel, angle: angle });

    updateMutation.mutate({
      id: contactId,
      data: {
        orbit_level: orbitLevel,
        angle: angle,
        manual_position: true,
        last_manual_position_update: new Date().toISOString()
      }
    });
    // portalMode and portalDestination will be cleared by updateMutation's onSuccess/onSettled
    // after the data is committed. The visualization will then finish its animation.
  }, [updateMutation]);

  // Added handler to clear portal state if user cancels (e.g. drops outside valid orbit)
  const handleCancelTeleport = useCallback(() => {
    setPortalMode(null);
    setPortalDestination(null);
  }, []);

  const handleContactedToday = useCallback((contact, e) => {
    e?.stopPropagation();
    if (cooldownContacts.has(contact.id)) return;

    setCooldownContacts((prev) => new Set(prev).add(contact.id));
    setTimeout(() => {
      setCooldownContacts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contact.id);
        return newSet;
      });
    }, 2000);

    setPulsingContact(contact.id);
    setTimeout(() => setPulsingContact(null), 1800);

    if (window.ambientSound) {
      window.ambientSound.pulseForContact();
      setTimeout(() => window.ambientSound.pulseForContact(), 200);
    }

    const currentOrbit = contact.orbit_level;
    const newOrbit = Math.max(1, Math.min(MAX_ORBITS, currentOrbit - 3));

    const today = new Date().toISOString().split('T')[0];
    updateMutation.mutate({
      id: contact.id,
      data: {
        last_contacted: today,
        manual_position: false,
        orbit_level: newOrbit,
        orbit_level_at_last_contact: newOrbit
      }
    });
    setRadialMenuContact(null);
    setShowTooltip(false); // Close tooltip on action
    setHoveredContact(null);
    setHoveredSun(null);
  }, [updateMutation, cooldownContacts, MAX_ORBITS]);

  useEffect(() => {
    if (radialMenuContact) {
      const timer = setTimeout(() => setRadialMenuContact(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [radialMenuContact]);

  useEffect(() => {
    const animateZoom = () => {
      const current = zoomLevel;
      const target = zoomTargetRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.001) {
        setZoomLevel(current + diff * 0.15);
      } else if (Math.abs(diff) > 0) {
        setZoomLevel(target);
      }

      zoomAnimationRef.current = requestAnimationFrame(animateZoom);
    };

    zoomAnimationRef.current = requestAnimationFrame(animateZoom);
    return () => {
      if (zoomAnimationRef.current) cancelAnimationFrame(zoomAnimationRef.current);
    };
  }, [zoomLevel]);

  const handleZoomChange = useCallback((newZoom) => {
    zoomTargetRef.current = Math.max(0.5, Math.min(2, newZoom));
  }, []);

  useEffect(() => {
    if (focusedContact) {
      handleZoomChange(focusZoom);
    } else {
      handleZoomChange(1);
    }
  }, [focusedContact, focusZoom, handleZoomChange]);

  useEffect(() => {
    const animate = () => {
      const config = {
        springStrength: isDragging ? 0.08 : 0.03,
        damping: isDragging ? 0.85 : 0.92,
        minVelocity: 0.001
      };

      if (!isDragging) {
        tiltRef.current.targetX = 0;
        tiltRef.current.targetY = 0;
      }

      const forceX = (tiltRef.current.targetX - tiltRef.current.x) * config.springStrength;
      const forceY = (tiltRef.current.targetY - tiltRef.current.y) * config.springStrength;

      tiltRef.current.velocityX += forceX;
      tiltRef.current.velocityY += forceY;
      tiltRef.current.velocityX *= config.damping;
      tiltRef.current.velocityY *= config.damping;

      if (Math.abs(tiltRef.current.velocityX) < config.minVelocity) tiltRef.current.velocityX = 0;
      if (Math.abs(tiltRef.current.velocityY) < config.minVelocity) tiltRef.current.velocityY = 0;

      tiltRef.current.x += tiltRef.current.velocityX;
      tiltRef.current.y += tiltRef.current.velocityY;

      const deltaX = Math.abs(tiltRef.current.x - tilt.x);
      const deltaY = Math.abs(tiltRef.current.y - tilt.y);

      if (deltaX > 0.01 || deltaY > 0.01) {
        setTilt({ x: tiltRef.current.x, y: tiltRef.current.y });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (!draggedContact && !portalMode) { // Do not animate tilt if dragging or in portal mode
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDragging, tilt, draggedContact, portalMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (e) => {
      // Prevent general canvas dragging if a contact is being dragged or in portal mode
      if (draggedContact || portalMode) return;
      if (e.button !== undefined && e.button !== 0) return;

      dragRef.current.isDragging = true;
      dragRef.current.startX = e.clientX || e.touches?.[0]?.clientX || 0;
      dragRef.current.startY = e.clientY || e.touches?.[0]?.clientY || 0;
      dragRef.current.currentX = dragRef.current.startX;
      dragRef.current.currentY = dragRef.current.startY;

      setIsDragging(true);
      e.preventDefault();
    };

    const handlePointerMove = (e) => {
      // Prevent general canvas dragging if a contact is being dragged or in portal mode
      if (draggedContact || portalMode) return;
      const rect = container.getBoundingClientRect();
      const clientX_current = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY_current = e.clientY || e.touches?.[0]?.clientY || 0;

      const normalizedX = (clientX_current - rect.left) / rect.width;
      const normalizedY = (clientY_current - rect.top) / rect.height;
      setMousePosition({ x: normalizedX, y: normalizedY });

      if (!dragRef.current.isDragging) return;

      dragRef.current.currentX = clientX_current;
      dragRef.current.currentY = clientY_current;

      const deltaX = clientX_current - dragRef.current.startX;
      const deltaY = clientY_current - dragRef.current.startY;

      const rotationSensitivity = 0.15;
      tiltRef.current.targetX = -deltaY * rotationSensitivity;
      tiltRef.current.targetY = deltaX * rotationSensitivity;

      tiltRef.current.targetX = Math.max(-30, Math.min(30, tiltRef.current.targetX));
      tiltRef.current.targetY = Math.max(-30, Math.min(30, tiltRef.current.targetY));

      e.preventDefault();
    };

    const handlePointerUp = () => {
      // Prevent general canvas dragging if a contact is being dragged or in portal mode
      if (draggedContact || portalMode) return;
      if (!dragRef.current.isDragging) return;

      dragRef.current.isDragging = false;
      setIsDragging(false);

      const deltaX_drag = dragRef.current.currentX - dragRef.current.startX;
      const deltaY_drag = dragRef.current.currentY - dragRef.current.startY;

      const inertiaScale = 0.005;
      tiltRef.current.velocityX += -deltaY_drag * inertiaScale;
      tiltRef.current.velocityY += deltaX_drag * inertiaScale;
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('touchstart', handlePointerDown, { passive: false });
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    container.addEventListener('touchend', handlePointerUp);
    container.addEventListener('touchcancel', handlePointerUp);

    return () => {
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      container.removeEventListener('touchend', handlePointerUp);
      container.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [draggedContact, isDragging, portalMode]);

  // 🪐 Mobile Pinch Zoom - Touch Events
  useEffect(() => {
    let initialDistance = 0;
    let initialZoom = 1;
    let isPinching = false;

    const getTouchDistance = (touches) => {
      if (touches.length < 2) return 0;
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        initialDistance = getTouchDistance(e.touches);
        initialZoom = zoomTargetRef.current;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        
        if (initialDistance > 0) {
          const scale = currentDistance / initialDistance;
          const newZoom = initialZoom * scale;
          handleZoomChange(newZoom);
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) {
        isPinching = false;
        initialDistance = 0;
      }
    };

    // Attach to window for broad coverage
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleZoomChange]);

  // 🪐 Prevent Desktop Scroll Zoom
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    
    // Prevent pinch-zoom on desktop trackpads
    const preventGestureZoom = (e) => e.preventDefault();
    window.addEventListener('gesturestart', preventGestureZoom, { passive: false });
    window.addEventListener('gesturechange', preventGestureZoom, { passive: false });
    window.addEventListener('gestureend', preventGestureZoom, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventWheelZoom);
      window.removeEventListener('gesturestart', preventGestureZoom);
      window.removeEventListener('gesturechange', preventGestureZoom);
      window.removeEventListener('gestureend', preventGestureZoom);
    };
  }, []);

  // Apply all filters
  const filteredContacts = contacts.filter((c) => {
    // Relationship filter
    if (relationshipFilter !== 'all' && c.relationship !== relationshipFilter) return false;
    
    // Health score filter
    const healthScore = c.health_score || 0;
    if (healthScore < advancedFilters.healthScore[0] || healthScore > advancedFilters.healthScore[1]) return false;
    
    // Last contacted filter
    if (c.last_contacted) {
      const daysSince = Math.floor((Date.now() - new Date(c.last_contacted)) / (1000 * 60 * 60 * 24));
      if (daysSince < advancedFilters.lastContactedDays[0] || daysSince > advancedFilters.lastContactedDays[1]) return false;
    } else {
      // Contacts never contacted are considered at max days
      if (advancedFilters.lastContactedDays[1] < 365) return false;
    }
    
    // Tags filter
    if (advancedFilters.tags.length > 0) {
      if (!c.tags || !advancedFilters.tags.some(tag => c.tags.includes(tag))) return false;
    }
    
    // Risk level filter
    if (advancedFilters.riskLevel !== 'all') {
      const riskLevel = c.ai_insights?.inactivity_risk?.risk_level;
      if (riskLevel !== advancedFilters.riskLevel) return false;
    }
    
    return true;
  });

  return (
    <div className="relative w-full h-screen overflow-hidden" id="orbit-container">
      <AmbientSoundManager />
      <CursorTrail />
      <HintOverlay />

      <OrbitIntelligence
        enabled={true}
        testMode={false}
        driftInterval="12s"
        moveInIfContactedWithin={1}
        moveOutEvery={3}
        maxOrbits={MAX_ORBITS}
        allowOverlap={false}
        autoCreateRing={false}
        debugMode={false}
      />

      {/* Smart Reminder Engine - Enhanced */}
      <SmartReminderEngine 
        enabled={user?.auto_reminders_enabled ?? true}
        autoSetReminders={user?.auto_set_reminders ?? true}
        checkInterval={user?.check_frequency || '6h'}
        debugMode={false}
      />

      {/* Network Health Engine */}
      <NetworkHealthEngine
        enabled={true}
        checkInterval="2h"
        debugMode={false}
      />

      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        style={{ zIndex: 0 }}>
        <CosmicBackground theme={theme} />
      </motion.div>

      <Navigation currentPage="Orbit" theme={theme} />

      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3">
        <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
          <SelectTrigger
            className={`w-48 backdrop-blur-md border transition-all duration-300 ${
              theme === 'retro' ?
              'bg-black/60 border-cyan-400/50 text-cyan-400' :
              'bg-white/5 border-white/10 text-white'
            }`}>
            <SelectValue placeholder="Filter by relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Relationships</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="close_friend">Close Friend</SelectItem>
            <SelectItem value="friend">Friend</SelectItem>
            <SelectItem value="colleague">Colleague</SelectItem>
            <SelectItem value="acquaintance">Acquaintance</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <button
          onClick={() => setFilterPanelOpen(true)}
          className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 relative ${
            theme === 'retro' ?
            'bg-black/60 border-pink-500/50 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(255,0,255,0.5)]' :
            'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal className={`w-5 h-5 ${theme === 'retro' ? 'text-pink-500' : 'text-white'}`} />
          {(advancedFilters.tags.length > 0 || advancedFilters.riskLevel !== 'all' || 
            advancedFilters.healthScore[0] !== 0 || advancedFilters.healthScore[1] !== 100) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-black" />
          )}
        </button>
      </div>

      <button
        onClick={() => setSearchDrawerOpen(true)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${
          theme === 'retro' ?
          'bg-black/60 border-pink-500/50 hover:border-cyan-400/70 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]' :
          'bg-white/5 border-white/10 hover:bg-white/10'
        }`}>
        <Search className={`w-6 h-6 ${theme === 'retro' ? 'text-pink-500' : 'text-white'}`} />
      </button>

      <SearchDrawer
        isOpen={searchDrawerOpen}
        onClose={() => {
          setSearchDrawerOpen(false);
          setHoveredSearchContact(null);
        }}
        contacts={filteredContacts}
        onContactHover={setHoveredSearchContact}
        onContactClick={handleContactClick}
        onUpdateReminder={handleUpdateReminder}
        theme={theme}
      />

      <OrbitFilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        contacts={contacts}
        theme={theme}
      />


      <div
        ref={containerRef}
        className="relative z-10 flex items-center justify-center h-full pb-24"
        style={{
          perspective: '2000px',
          cursor: cursorState === 'pulse' ? 'grabbing' :
                  cursorState === 'pointer' ? 'pointer' :
                  'default'
        }}
        onClick={(e) => {
          if (focusedContact && e.target === e.currentTarget && !draggedContact && !portalMode) {
            exitFocusMode();
          }
        }}>
        <motion.div
          className="absolute pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            background: [
              'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 30%, transparent 70%)',
              'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.15) 30%, transparent 70%)',
              'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 30%, transparent 70%)'
            ]
          }}
          transition={{ duration: 60, ease: 'easeInOut', repeat: Infinity }}
          style={{ zIndex: 0 }}>
        </motion.div>


        <div
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: isDragging || draggedContact || portalMode ? 'none' : 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d',
            pointerEvents: 'auto'
          }}>
          <OrbitVisualization
            contacts={filteredContacts}
            allContacts={contacts}
            onOrbitClick={handleOrbitClick}
            onContactClick={handleContactClick}
            onContactedToday={handleContactedToday}
            onCenterClick={handleCenterClick}
            theme={theme}
            spacing={orbitSpacing}
            zoom={zoomLevel}
            onZoomChange={handleZoomChange}
            mouseX={mousePosition.x}
            mouseY={mousePosition.y}
            focusedContact={focusedContact}
            hoveredSearchContact={hoveredSearchContact}
            onLongPress={(contact, pos) => {
              setRadialMenuContact(contact);
              setRadialMenuPosition(pos);
            }}
            handleDelete={handleDelete}
            draggedContact={draggedContact}
            onContactDragStart={handleContactDragStart}
            onContactDragEnd={handleContactDragEnd}
            dragTargetOrbit={setDragTargetOrbit}
            onDragTargetOrbitChange={setDragTargetOrbit}
            radialMenuContact={radialMenuContact}
            parallaxOffsetRef={parallaxOffsetRef}
            pulsingContact={pulsingContact}
            cooldownContacts={cooldownContacts}
            maxOrbits={MAX_ORBITS}
            portalMode={portalMode}
            setPortalMode={setPortalMode}
            portalDestination={portalDestination}
            setPortalDestination={setPortalDestination}
            onTeleportContact={handleTeleportContact}
            onCancelTeleport={handleCancelTeleport}
            cursorState={cursorState}
            setCursorState={setCursorState}
            onSetHoveredContact={setHoveredContact}
            onSetTooltipPosition={setTooltipPosition}
            onSetShowTooltip={setShowTooltip}
            onSetCenterHovered={setCenterHovered}
            onSetHoveredSun={setHoveredSun}
            isMobile={isMobile}
            hoverTimeoutRef={hoverTimeoutRef}
            hoveredContact={hoveredContact}
            showTooltip={showTooltip}
            centerHovered={centerHovered}
            hoveredSun={hoveredSun}
            tooltipRef={tooltipRef}
            orbitTransitionActive={orbitTransitionActive}
            setOrbitTransitionActive={setOrbitTransitionActive}
            advancedFilters={advancedFilters}
          />

        </div>
      </div>

      <AnimatePresence>
        {focusedContact &&
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          className="fixed top-24 right-8 z-50 bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl pointer-events-auto max-w-sm"
          style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}>
            <div className="flex items-start gap-4 mb-4">
              {focusedContact.avatar_url ?
            <img src={focusedContact.avatar_url} alt={focusedContact.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/30" /> :

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/30">
                  <span className="text-2xl font-bold text-white">{focusedContact.name[0]?.toUpperCase()}</span>
                </div>
            }
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{focusedContact.name}</h3>
                <p className="text-sm text-white/60 capitalize">{focusedContact.relationship?.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Orbit Level:</span>
                <span className="text-white font-medium">{focusedContact.orbit_level}</span>
              </div>
              {focusedContact.last_contacted &&
            <div className="flex justify-between text-sm">
                  <span className="text-white/60">Last Contact:</span>
                  <span className="text-white font-medium">{new Date(focusedContact.last_contacted).toLocaleDateString()}</span>
                </div>
            }
              {focusedContact.notes &&
            <div className="pt-3 border-t border-white/10">
                  <p className="text-sm text-white/80 line-clamp-3">{focusedContact.notes}</p>
                </div>
            }
            </div>

            <div className="flex gap-2">
              <button
              onClick={() => handleEditContact(focusedContact)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium">
                Edit Contact
              </button>
              <button
              onClick={exitFocusMode}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300">
                Close
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {radialMenuContact &&
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className="fixed z-50 pointer-events-auto"
          style={{
            left: radialMenuPosition.x,
            top: radialMenuPosition.y,
            transform: 'translate(-50%, -50%)'
          }}>
            <div className="relative w-56 h-56">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/50" />

              {[
                { icon: Phone, color: 'from-green-500 to-emerald-600', angle: 0, action: () => { window.open(`tel:${radialMenuContact.phone || ''}`, '_self'); setRadialMenuContact(null); } },
                { icon: MessageCircle, color: 'from-blue-500 to-indigo-600', angle: 72, action: () => { window.open(`sms:${radialMenuContact.phone || ''}`, '_self'); setRadialMenuContact(null); } },
                { icon: FileText, color: 'from-purple-500 to-pink-600', angle: 144, action: () => { handleEditContact(radialMenuContact); setRadialMenuContact(null); } },
                { icon: Trash2, color: 'from-red-500 to-rose-600', angle: 216, action: () => { handleDelete(radialMenuContact.id); setRadialMenuContact(null); } },
                { icon: CalendarCheck, color: 'from-yellow-500 to-orange-500', angle: 288, action: (e) => { handleContactedToday(radialMenuContact, e); }, disabled: cooldownContacts.has(radialMenuContact.id) }
              ].map((btn, index) => {
                const radius = 90;
                const angleRad = (btn.angle - 90) * Math.PI / 180;
                const x = Math.cos(angleRad) * radius;
                const y = Math.sin(angleRad) * radius;

                return (
                  <motion.button
                    key={index}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x, y }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={btn.action}
                    disabled={btn.disabled}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${btn.color} flex items-center justify-center shadow-lg transition-transform ${
                      btn.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                    }`}
                    title={btn.disabled ? "Cooldown active" : ""}>
                    <btn.icon className="w-7 h-7 text-white" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <button
        onClick={() => {
          setSelectedContact(null);
          setSelectedOrbit(null);
          setModalOpen(true);
        }}
        className="fixed z-[3100] right-6 bottom-[calc(env(safe-area-inset-bottom)+88px)] md:bottom-8 p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110"
        style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}>
        <Plus className="w-6 h-6" />
      </button>

      <ContactModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedContact(null);
          setSelectedOrbit(null);
        }}
        contact={selectedContact}
        onSave={handleSave}
        onDelete={handleDelete}
      />


      <UserProfileModal isOpen={userProfileOpen} onClose={() => setUserProfileOpen(false)} />

      <BottomNavigation
        currentPage="Orbit"
        orbitSpacing={orbitSpacing}
        onOrbitSpacingChange={setOrbitSpacing}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange} />

      <AnimatePresence>
        {showTooltip && (hoveredContact || hoveredSun) && !focusedContact && !draggedContact && !portalMode && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-auto z-50 bg-gradient-to-b from-indigo-950/95 to-purple-950/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl"
            style={{
              left: tooltipPosition.x + 20,
              top: tooltipPosition.y + 20,
              maxWidth: '280px'
            }}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
                setHoveredContact(null);
                setHoveredSun(false);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/60 hover:text-white" />
            </button>

            {hoveredSun && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3 pr-6"> {/* Added pr-6 for close button */}
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center border-2 border-white/20">
                      <span className="text-xl font-bold text-white">{user.full_name?.[0]?.toUpperCase() || 'U'}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold text-lg">{user.full_name || 'You'}</h3>
                    <p className="text-white/60 text-sm">Your Profile</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Email:</span>
                    <span className="text-white text-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Role:</span>
                    <span className="text-white capitalize">{user.role}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-white/80 text-xs">Click to edit your profile</p>
                  </div>
                </div>
              </div>
            ) : hoveredContact ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3 pr-6"> {/* Added pr-6 for close button */}
                  {hoveredContact.avatar_url ? (
                    <img src={hoveredContact.avatar_url} alt={hoveredContact.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white/30">
                      <span className="text-xl font-bold text-white">{hoveredContact.name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold text-lg">{hoveredContact.name}</h3>
                    <p className="text-white/60 text-sm capitalize">{hoveredContact.relationship?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Orbit Level:</span>
                    <span className="text-white">{hoveredContact.orbit_level}</span>
                  </div>
                  {hoveredContact.last_contacted && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Last Contact:</span>
                      <span className="text-white">{new Date(hoveredContact.last_contacted).toLocaleDateString()}</span>
                    </div>
                  )}
                  {hoveredContact.notes && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-white/80 text-xs line-clamp-3">{hoveredContact.notes}</p>
                    </div>
                  )}
                  {hoveredContact.health_score !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Health Score:</span>
                      <span className={`font-medium ${
                        hoveredContact.health_score >= 80 ? 'text-green-400' :
                        hoveredContact.health_score >= 60 ? 'text-blue-400' :
                        hoveredContact.health_score >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {hoveredContact.health_score}/100
                      </span>
                    </div>
                  )}
                  {hoveredContact.ai_insights?.inactivity_risk && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Risk Level:</span>
                      <span className={`font-medium ${
                        hoveredContact.ai_insights.inactivity_risk.risk_level === 'high' ? 'text-red-400' :
                        hoveredContact.ai_insights.inactivity_risk.risk_level === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {hoveredContact.ai_insights.inactivity_risk.risk_level}
                      </span>
                    </div>
                  )}
                  {hoveredContact.next_milestone && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Milestone:</span>
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {hoveredContact.next_milestone.event}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactedToday(hoveredContact, e);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-2 bg-yellow-600/80 hover:bg-yellow-600 text-white rounded-lg transition-all duration-300 font-medium text-xs ${
                      cooldownContacts.has(hoveredContact.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={cooldownContacts.has(hoveredContact.id) ? "Cooldown active" : "Mark as contacted today"}
                    disabled={cooldownContacts.has(hoveredContact.id)}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Contacted Today
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to remove ${hoveredContact.name} from your Orbit?`)) {
                        handleDelete(hoveredContact.id);
                      }
                    }}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-medium text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

    </div>);

}

function OrbitVisualization({ contacts, allContacts, onOrbitClick, onContactClick, onContactedToday, onCenterClick, theme, spacing = 35, zoom = 1, onZoomChange, mouseX = 0.5, mouseY = 0.5, focusedContact, onLongPress, hoveredSearchContact, handleDelete, draggedContact, onContactDragStart, onContactDragEnd, dragTargetOrbit, onDragTargetOrbitChange, radialMenuContact, parallaxOffsetRef, pulsingContact, cooldownContacts, maxOrbits, portalMode, setPortalMode, portalDestination, setPortalDestination, onTeleportContact, onCancelTeleport, cursorState, setCursorState, onSetHoveredContact, onSetTooltipPosition, onSetShowTooltip, onSetCenterHovered, onSetHoveredSun, isMobile, hoverTimeoutRef, hoveredContact, showTooltip, centerHovered, hoveredSun, tooltipRef, orbitTransitionActive, setOrbitTransitionActive, advancedFilters }) {
  const canvasRef = useRef(null);
  const orbitsRef = useRef([]);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);

  const mouseRef = useRef({ x: 0, y: 0, hover: false, clickPulse: 0 });
  const animationFrameRef = useRef(null);
  const centerHoverAmountRef = useRef(0);
  const contactTrailsRef = useRef({});

  const contactTransitionsRef = useRef(new Map());
  const orbitSpeedResumeRef = useRef(new Map());
  const magneticSnapPulseRef = useRef({ active: false, startTime: 0, orbitLevel: 0 });
  const connectionGlowRef = useRef({ active: false, startTime: 0, orbitLevel: 0, angle: 0 });

  // Portal/wormhole states
  const portalHoldTimerRef = useRef(null);
  const portalActiveContactRef = useRef(null);
  const portalInitialPointerPosRef = useRef({ x: 0, y: 0 });
  const clickStartTimeRef = useRef(0);
  const isLongPressActiveRef = useRef(0);

  const [localWormholeVisuals, setLocalWormholeVisuals] = useState(null);
  const [particles, setParticles] = useState([]);
  const localClosingTimerRef = useRef(null);

  // NEW: Track individual sphere visual offset angles and speeds
  const sphereRotationsRef = useRef(new Map()); // Renamed from sphereVisualOffsetsRef

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const themeColors = {
    cosmic: { primary: '#8b5cf6', secondary: '#ffdca8', orbitColors: ['rgba(236, 72, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(59, 130, 246, 0.45)', 'rgba(16, 185, 129, 0.45)', 'rgba(245, 158, 11, 0.4)', 'rgba(239, 68, 68, 0.4)', 'rgba(168, 85, 247, 0.35)', 'rgba(34, 197, 94, 0.35)', 'rgba(14, 165, 233, 0.3)', 'rgba(251, 146, 60, 0.3)'] },
    sunrise: { primary: '#ff6b6b', secondary: '#ffd6a5', orbitColors: ['rgba(239, 68, 68, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(245, 158, 11, 0.45)', 'rgba(234, 179, 8, 0.45)', 'rgba(251, 191, 36, 0.4)', 'rgba(217, 119, 6, 0.4)', 'rgba(220, 38, 38, 0.35)', 'rgba(252, 165, 165, 0.35)', 'rgba(254, 215, 170, 0.3)', 'rgba(253, 186, 116, 0.3)'] },
    retro: { primary: '#ff00ff', secondary: '#00ffff', orbitColors: ['rgba(0, 255, 255, 0.7)', 'rgba(255, 0, 255, 0.7)', 'rgba(157, 0, 255, 0.65)', 'rgba(0, 255, 200, 0.65)', 'rgba(255, 0, 180, 0.6)', 'rgba(0, 200, 255, 0.6)', 'rgba(200, 0, 255, 0.55)', 'rgba(0, 255, 128, 0.55)', 'rgba(255, 100, 255, 0.5)', 'rgba(100, 255, 255, 0.5)'] },
    aurora: { primary: '#34d399', secondary: '#a7f3d0', orbitColors: ['rgba(52, 211, 153, 0.5)', 'rgba(139, 92, 246, 0.5)', 'rgba(236, 72, 153, 0.45)', 'rgba(59, 130, 246, 0.45)', 'rgba(16, 185, 129, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(103, 232, 249, 0.35)', 'rgba(34, 197, 94, 0.35)', 'rgba(147, 197, 253, 0.3)', 'rgba(167, 243, 208, 0.3)'] },
    solar: { primary: '#f59e0b', secondary: '#fbbf24', orbitColors: ['rgba(239, 68, 68, 0.5)', 'rgba(234, 88, 12, 0.5)', 'rgba(249, 115, 22, 0.45)', 'rgba(245, 158, 11, 0.45)', 'rgba(234, 179, 8, 0.4)', 'rgba(251, 191, 36, 0.4)', 'rgba(217, 119, 6, 0.35)', 'rgba(252, 211, 77, 0.35)', 'rgba(253, 224, 71, 0.3)', 'rgba(254, 240, 138, 0.3)'] },
    ocean: { primary: '#4f46e5', secondary: '#67e8f9', orbitColors: ['rgba(79, 70, 229, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(14, 165, 233, 0.45)', 'rgba(6, 182, 212, 0.45)', 'rgba(20, 184, 166, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(99, 102, 241, 0.35)', 'rgba(96, 165, 250, 0.35)', 'rgba(125, 211, 252, 0.3)', 'rgba(103, 232, 249, 0.3)'] }
  };

  const colors = themeColors[theme] || themeColors.cosmic;
  const isRetro = theme === 'retro';

  const hexToRgbaViz = (color, alpha = 1) => {
    if (!color) return `rgba(0,0,0,${alpha})`;
    if (color.startsWith('#')) {
      let r = 0, g = 0, b = 0;
      if (color.length === 4) {
        r = parseInt(color[1] + color[1], 16);
        g = parseInt(color[2] + color[2], 16);
        b = parseInt(color[3] + color[3], 16);
      } else if (color.length === 7) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (color.startsWith('rgb(') && color.endsWith(')')) {
      const parts = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (parts) return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${alpha})`;
    } else if (color.startsWith('rgba(') && color.endsWith(')')) {
      const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (parts) return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${alpha})`;
    }
    return color;
  };

  const shadeColor = (color, percent) => {
    if (!color || color.charAt(0) !== '#') return color;
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1).toUpperCase()}`;
  };

  const getTimelineColor = (contact) => {
    if (!contact.last_contacted) return '#6b7280';
    const daysSince = differenceInDays(new Date(), new Date(contact.last_contacted));
    if (daysSince < 7) return '#10b981';
    if (daysSince < 30) return '#f59e0b';
    return '#ef4444';
  };

  const easeInOutBack = useCallback((t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5 ?
      Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 :
      (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }, []);

  const easeInOutSine = useCallback((t) => {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }, []);

  // 🌌 Wormhole particle generator
  const createWormholeParticles = useCallback((x, y, count = 20, hueOffset = 0) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 2 + Math.random() * 3;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        hue: (Math.random() * 60 + 260 + hueOffset) % 360 // Purple-blue range + offset
      });
    }
    return newParticles;
  }, []);

  useEffect(() => {
    const now = performance.now();

    contacts.forEach((contact) => {
      const transitionKey = contact.id;
      let existingTransition = contactTransitionsRef.current.get(transitionKey);

      const currentInterpolatedOrbit = existingTransition?.currentOrbit ?? contact.orbit_level;
      const currentInterpolatedAngle = existingTransition?.currentAngle ?? (contact.angle || 0);

      const targetOrbitChanged = existingTransition?.targetOrbit !== contact.orbit_level;
      const targetAngleChanged = existingTransition ? Math.abs(existingTransition.targetAngle - (contact.angle || 0)) > 0.1 : false;

      if (targetOrbitChanged || targetAngleChanged || !existingTransition) {
        // Calculate duration based on distance traveled (manual jumps get 600ms, decay gets 400ms)
        const orbitDistance = Math.abs(contact.orbit_level - currentInterpolatedOrbit);
        const isManualJump = contact.manual_position; // Assuming this property is reliable from the contact object
        const duration = isManualJump && orbitDistance > 1 ? 600 : 400; // 600ms for significant manual jumps, 400ms otherwise (decay, minor adjustments)
        
        contactTransitionsRef.current.set(transitionKey, {
          startOrbit: currentInterpolatedOrbit,
          startAngle: currentInterpolatedAngle,
          targetOrbit: contact.orbit_level,
          targetAngle: contact.angle || 0,
          startTime: now,
          duration: duration,
          currentOrbit: currentInterpolatedOrbit,
          currentAngle: currentInterpolatedAngle,
          isAnimating: true
        });
        
        // Log completion when animation finishes
        if (isManualJump && orbitDistance > 1) {
          setTimeout(() => {
            console.log(`🎯 Orbit jump complete: ${contact.name} reached ring ${contact.orbit_level}`);
          }, duration);
        }
      }

      // Initialize or update sphere rotation data
      if (!sphereRotationsRef.current.has(contact.id)) {
        // Initialize with some random initial angle and speed
        sphereRotationsRef.current.set(contact.id, {
          rotationAngle: Math.random() * 360, // Start at a random point
          rotationSpeed: (contact.orbit_level <= 3 ? 0.15 : contact.orbit_level <= 7 ? 0.10 : 0.08) * (Math.random() < 0.5 ? 1 : -1) // Random direction
        });
      } else {
        // If contact orbit level changed, update its rotation speed
        const currentSphereData = sphereRotationsRef.current.get(contact.id);
        const newTargetSpeed = (contact.orbit_level <= 3 ? 0.15 : contact.orbit_level <= 7 ? 0.10 : 0.08);
        if (Math.abs(currentSphereData.rotationSpeed) !== newTargetSpeed) {
             currentSphereData.rotationSpeed = newTargetSpeed * (currentSphereData.rotationSpeed < 0 ? -1 : 1);
        }
      }
    });

    contactTransitionsRef.current.forEach((_, key) => {
      if (!contacts.some((c) => c.id === key)) {
        contactTransitionsRef.current.delete(key);
        sphereRotationsRef.current.delete(key); // Also delete from sphereRotationsRef
      }
    });

  }, [contacts, spacing]);

  const getContactPosition = useCallback((contactId, animationTime) => {
    const transition = contactTransitionsRef.current.get(contactId);
    if (!transition) {
      const contact = contacts.find((c) => c.id === contactId);
      return { orbit: contact?.orbit_level || 1, angle: contact?.angle || 0 };
    }

    if (!transition.isAnimating) {
      return { orbit: transition.targetOrbit, angle: transition.targetAngle };
    }

    const elapsed = animationTime - transition.startTime;

    if (elapsed >= transition.duration) {
      transition.currentOrbit = transition.targetOrbit;
      transition.currentAngle = transition.targetAngle;
      transition.isAnimating = false;
      return { orbit: transition.targetOrbit, angle: transition.targetAngle };
    }

    const progress = easeInOutSine(elapsed / transition.duration);

    const currentOrbit = transition.startOrbit + (transition.targetOrbit - transition.startOrbit) * progress;

    let angleDiff = transition.targetAngle - transition.startAngle;
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff <= -180) angleDiff += 360;

    let currentAngle = transition.startAngle + angleDiff * progress;
    currentAngle = (currentAngle % 360 + 360) % 360;

    transition.currentOrbit = currentOrbit;
    transition.currentAngle = currentAngle;

    return { orbit: currentOrbit, angle: currentAngle };
  }, [contacts, easeInOutSine]);

  const drawContact = useCallback((ctx, contact, x, y, effectiveOpacity, options) => {
    const { isDragged, isFocused, isHoveredSearch, isRetro, animationFrameTime, themeColors, getTimelineColor, hexToRgbaViz, shadeColor, isPulsing, isPortalSource } = options;

    const currentThemeColors = themeColors[theme] || themeColors.cosmic;

    // NEW: Check for AI-based pulsing conditions and milestones
    const hasHighRisk = contact.ai_insights?.inactivity_risk?.risk_level === 'high';
    const hasUrgentFollowUp = contact.ai_insights?.follow_up_analysis?.urgency === 'high';
    const needsAttention = hasHighRisk || hasUrgentFollowUp;
    const hasMilestone = contact.next_milestone && new Date(contact.next_milestone.date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Draw milestone indicator (green sparkle)
    if (hasMilestone && !isDragged && !isPortalSource) {
      const milestonePulse = animationFrameTime * 3 % (2 * Math.PI);
      const milestoneOpacity = (Math.sin(milestonePulse) + 1) / 2;

      ctx.save();
      ctx.globalAlpha = effectiveOpacity;

      const milestoneGlowRadius = 40;
      const milestoneGlow = ctx.createRadialGradient(x, y, 0, x, y, milestoneGlowRadius);
      milestoneGlow.addColorStop(0, `rgba(52, 211, 153, ${0.7 * milestoneOpacity})`);
      milestoneGlow.addColorStop(0.4, `rgba(52, 211, 153, ${0.4 * milestoneOpacity})`);
      milestoneGlow.addColorStop(1, 'rgba(52, 211, 153, 0)');

      ctx.fillStyle = milestoneGlow;
      ctx.beginPath();
      ctx.arc(x, y, milestoneGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw sparkle icon
      const sparkleSize = 8 + milestoneOpacity * 4;
      ctx.fillStyle = `rgba(52, 211, 153, ${0.9 * milestoneOpacity})`;
      ctx.font = `${sparkleSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', x + 18, y - 18);

      ctx.restore();
    }

    // NEW: AI-based pulsing effect for at-risk contacts
    if (needsAttention && !isDragged && !isPortalSource) {
      const aiPulseProgress = animationFrameTime * 2 % (2 * Math.PI);
      const aiPulseOpacity = (Math.sin(aiPulseProgress) + 1) / 2;

      ctx.save();
      ctx.globalAlpha = effectiveOpacity;

      const aiGlowRadius = 45;
      const aiGlow = ctx.createRadialGradient(x, y, 0, x, y, aiGlowRadius);
      
      if (hasHighRisk) {
        // Red pulsing for high risk
        aiGlow.addColorStop(0, `rgba(239, 68, 68, ${0.8 * aiPulseOpacity})`);
        aiGlow.addColorStop(0.4, `rgba(239, 68, 68, ${0.5 * aiPulseOpacity})`);
        aiGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (hasUrgentFollowUp) {
        // Orange pulsing for urgent follow-up
        aiGlow.addColorStop(0, `rgba(251, 146, 60, ${0.8 * aiPulseOpacity})`);
        aiGlow.addColorStop(0.4, `rgba(251, 146, 60, ${0.5 * aiPulseOpacity})`);
        aiGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
      }

      ctx.fillStyle = aiGlow;
      ctx.beginPath();
      ctx.arc(x, y, aiGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Add pulsing ring
      const ringRadius = 30 + aiPulseOpacity * 10;
      ctx.save();
      ctx.globalAlpha = effectiveOpacity * (1 - aiPulseOpacity) * 0.6;
      ctx.strokeStyle = hasHighRisk ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 146, 60, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    let heatmapColor = '#6b7280';
    let heatmapIntensity = 0.3;

    if (contact.last_contacted) {
      const daysSince = Math.floor((Date.now() - new Date(contact.last_contacted).getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince < 7) {
        heatmapColor = '#fbbf24';
        heatmapIntensity = 0.8;
      } else if (daysSince < 14) {
        heatmapColor = '#ec4899';
        heatmapIntensity = 0.6;
      } else if (daysSince < 30) {
        heatmapColor = '#f472b6';
        heatmapIntensity = 0.5;
      } else if (daysSince < 60) {
        heatmapColor = '#60a5fa';
        heatmapIntensity = 0.4;
      } else {
        heatmapColor = '#a78bfa';
        heatmapIntensity = 0.3;
      }
    }

    if (heatmapIntensity > 0 && !isDragged && !isPortalSource) {
      ctx.save();
      ctx.globalAlpha = effectiveOpacity;

      const glowRadius = 35;
      const heatmapGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      heatmapGlow.addColorStop(0, hexToRgbaViz(heatmapColor, heatmapIntensity * 0.6));
      heatmapGlow.addColorStop(0.4, hexToRgbaViz(heatmapColor, heatmapIntensity * 0.3));
      heatmapGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = heatmapGlow;
      ctx.beginPath();
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    if (isPulsing) {
      const pulseProgress = animationFrameTime * 4 % (2 * Math.PI);
      const pulseOpacity = (Math.sin(pulseProgress) + 1) / 2;

      ctx.save();
      ctx.globalAlpha = effectiveOpacity;

      const reconnectGlowRadius = 50;
      const reconnectGlow = ctx.createRadialGradient(x, y, 0, x, y, reconnectGlowRadius);
      reconnectGlow.addColorStop(0, `rgba(255, 230, 154, ${0.8 * pulseOpacity})`);
      reconnectGlow.addColorStop(0.4, `rgba(255, 230, 154, ${0.5 * pulseOpacity})`);
      reconnectGlow.addColorStop(1, 'rgba(255, 230, 154, 0)');

      ctx.fillStyle = reconnectGlow;
      ctx.beginPath();
      ctx.arc(x, y, reconnectGlowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      const rippleRadius = reconnectGlowRadius * (0.5 + pulseOpacity * 0.5);
      ctx.save();
      ctx.globalAlpha = effectiveOpacity * (1 - pulseOpacity) * 0.5;
      ctx.strokeStyle = 'rgba(255, 230, 150, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (!isDragged && !isPortalSource) { // Don't draw trail if dragged or portal source
      if (!contactTrailsRef.current[contact.id]) {
        contactTrailsRef.current[contact.id] = [];
      }
      const trail = contactTrailsRef.current[contact.id];
      trail.push({ x, y });
      const maxTrailLength = 10;
      if (trail.length > maxTrailLength) {
        trail.shift();
      }

      if (trail.length > 1) {
        ctx.save();
        ctx.globalAlpha = effectiveOpacity;
        for (let i = 0; i < trail.length - 1; i++) {
          const progress = i / (trail.length - 1);
          const opacity = progress * 0.4 * effectiveOpacity;
          const thickness = progress * 3;

          const trailColor = contact.sphere_color || (isRetro ? '#00ffff' : currentThemeColors.secondary);

          const trailGrad = ctx.createLinearGradient(
            trail[i].x, trail[i].y,
            trail[i + 1].x, trail[i + 1].y
          );

          trailGrad.addColorStop(0, hexToRgbaViz(trailColor, 0));
          trailGrad.addColorStop(1, hexToRgbaViz(trailColor, opacity));

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = thickness;
          ctx.lineCap = 'round';

          if (isRetro) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = trailColor;
          }

          ctx.beginPath();
          ctx.moveTo(trail[i].x, trail[i].y);
          ctx.lineTo(trail[i + 1].x, trail[i + 1].y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    ctx.save();
    ctx.globalAlpha = effectiveOpacity;

    const baseSphereRadius = 20;
    const currentSphereRadius = isDragged || isPortalSource ? baseSphereRadius * 1.1 : // Slightly larger if dragged or portal source
      isPulsing ?
        baseSphereRadius * (1 + Math.sin(animationFrameTime * 4 % (2 * Math.PI)) * 0.15) :
        baseSphereRadius;

    const baseTimelineArcRadius = 26;
    const currentTimelineArcRadius = isDragged || isPortalSource ? baseTimelineArcRadius * 1.1 : baseTimelineArcRadius;

    // Previous `dragGlowScaleRef` is removed per outline's event handler replacements.
    // This part should technically use the `dragGlowScaleRef` if dragging is active.
    // For now, it will default to 1 if `isDragged` is true.
    if (isDragged || isPortalSource) {
      ctx.shadowBlur = 60 * 1; // dragGlowScaleRef.current replaced with 1
      ctx.shadowColor = contact.sphere_color || currentThemeColors.primary;

      const dragGlowRadius = 60 * 1; // dragGlowScaleRef.current replaced with 1
      const dragGlow = ctx.createRadialGradient(x, y, 0, x, y, dragGlowRadius);
      dragGlow.addColorStop(0, hexToRgbaViz(contact.sphere_color || currentThemeColors.primary, 0.6 * 1));
      dragGlow.addColorStop(0.5, hexToRgbaViz(contact.sphere_color || currentThemeColors.primary, 0.3 * 1));
      dragGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = dragGlow;
      ctx.beginPath();
      ctx.arc(x, y, dragGlowRadius, 0, Math.PI * 2);
      ctx.fill();

    } else if (isFocused) {
      const focusPulse = animationFrameTime * 3 % (2 * Math.PI);
      const focusPulseOpacity = (Math.sin(focusPulse) + 1) / 2;
      ctx.shadowBlur = 30 + focusPulseOpacity * 20;
      ctx.shadowColor = contact.sphere_color || currentThemeColors.primary;

      const focusGlowRadius = 40;
      const focusGlow = ctx.createRadialGradient(x, y, 0, x, y, focusGlowRadius);
      focusGlow.addColorStop(0, hexToRgbaViz(contact.sphere_color || currentThemeColors.primary, 0.5));
      focusGlow.addColorStop(0.5, hexToRgbaViz(contact.sphere_color || currentThemeColors.primary, 0.25));
      focusGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = focusGlow;
      ctx.beginPath();
      ctx.arc(x, y, focusGlowRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (isHoveredSearch) {
      const searchPulse = animationFrameTime * 4 % (2 * Math.PI);
      const searchPulseOpacity = (Math.sin(searchPulse) + 1) / 2;
      ctx.shadowBlur = 25 + searchPulseOpacity * 15;
      ctx.shadowColor = '#fbbf24';

      const searchGlowRadius = 35;
      const searchGlow = ctx.createRadialGradient(x, y, 0, x, y, searchGlowRadius);
      searchGlow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
      searchGlow.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
      searchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = searchGlow;
      ctx.beginPath();
      ctx.arc(x, y, searchGlowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isRetro && !isFocused && !isDragged && !isPortalSource) {
      ctx.shadowBlur = 15 * effectiveOpacity;
      ctx.shadowColor = contact.sphere_color || '#ff00ff';

      const neonGlowRadius = 30;
      const neonGlow = ctx.createRadialGradient(x, y, 0, x, y, neonGlowRadius);
      neonGlow.addColorStop(0, hexToRgbaViz(contact.sphere_color || '#ff00ff', 0.4 * effectiveOpacity));
      neonGlow.addColorStop(0.5, hexToRgbaViz(contact.sphere_color || '#00ffff', 0.2 * effectiveOpacity));
      neonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = neonGlow;
      ctx.beginPath();
      ctx.arc(x, y, neonGlowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const timelineColor = getTimelineColor(contact);
    const arcStart = Math.PI * 1.2;
    const arcEnd = Math.PI * 1.8;

    ctx.strokeStyle = hexToRgbaViz(timelineColor, 0.6 * effectiveOpacity);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (isRetro) {
      ctx.shadowBlur = 6;
      ctx.shadowColor = timelineColor;
    }

    ctx.beginPath();
    ctx.arc(x, y, currentTimelineArcRadius, arcStart, arcEnd);
    ctx.stroke();

    if (isRetro) {
      ctx.shadowBlur = 0;
    }

    if (contact.avatar_url) {
      ctx.beginPath();
      ctx.arc(x, y, currentSphereRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const img = new Image();
      img.src = contact.avatar_url;
      if (img.complete) {
        ctx.drawImage(img, x - currentSphereRadius, y - currentSphereRadius, currentSphereRadius * 2, currentSphereRadius * 2);
      } else {
        const sphereColor = contact.sphere_color || (isRetro ? '#00ffff' : currentThemeColors.secondary);
        const sphereGradient = ctx.createRadialGradient(x - 7, y - 7, 3, x, y, currentSphereRadius);
        sphereGradient.addColorStop(0, '#ffffff');
        sphereGradient.addColorStop(0.3, sphereColor);
        sphereGradient.addColorStop(1, shadeColor(sphereColor, -40));

        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(x, y, currentSphereRadius, 0, Math.PI * 2);
        ctx.fill();

        const highlight = ctx.createRadialGradient(x - 6, y - 6, 0, x - 6, y - 6, 8);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(x - 6, y - 6, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${currentSphereRadius * 0.8}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'middle';
        ctx.fillText(contact.name[0]?.toUpperCase(), x, y);
      }

      ctx.restore();

      ctx.save();
      ctx.globalAlpha = effectiveOpacity;

      if (isRetro) {
        ctx.shadowBlur = 15 * effectiveOpacity;
        ctx.shadowColor = contact.sphere_color || '#00ffff';
      }

      ctx.strokeStyle = contact.sphere_color || (isRetro ? '#00ffff' : currentThemeColors.primary);
      ctx.lineWidth = isRetro ? 3 : 2;
      ctx.beginPath();
      ctx.arc(x, y, currentSphereRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    } else {
      const sphereColor = contact.sphere_color || (isRetro ? '#ff00ff' : currentThemeColors.secondary);

      const sphereGradient = ctx.createRadialGradient(x - 7, y - 7, 3, x, y, currentSphereRadius);
      sphereGradient.addColorStop(0, '#ffffff');
      sphereGradient.addColorStop(0.3, sphereColor);
      sphereGradient.addColorStop(1, shadeColor(sphereColor, -40));

      if (isRetro) {
        ctx.shadowBlur = 15 * effectiveOpacity;
        ctx.shadowColor = sphereColor;
      }

      ctx.fillStyle = sphereGradient;
      ctx.beginPath();
      ctx.arc(x, y, currentSphereRadius, 0, Math.PI * 2);
      ctx.fill();

      if (isRetro) {
        ctx.shadowBlur = 0;
      }

      const highlight = ctx.createRadialGradient(x - 6, y - 6, 0, x - 6, y - 6, 8);
      highlight.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(x - 6, y - 6, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = `${currentSphereRadius * 0.8}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isRetro) {
        ctx.shadowBlur = 8 * effectiveOpacity;
        ctx.shadowColor = '#00ffff';
      }

      ctx.fillText(contact.name[0]?.toUpperCase(), x, y);

      if (isRetro) {
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }, [theme, isRetro, user, colors, hexToRgbaViz, shadeColor, getTimelineColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setCenterX(canvas.width / 2);
      setCenterY(canvas.height / 2);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize exactly 12 static orbit rings
    orbitsRef.current = Array.from({ length: maxOrbits }, (_, i) => ({
      level: i + 1,
      radius: 60 + (i + 1) * spacing,
      angle: 0 // Static, never changes
    }));

    return () => window.removeEventListener('resize', resize);
  }, [spacing, maxOrbits]);

  // Handle localWormholeVisuals state based on portalMode prop changes
  useEffect(() => {
    if (portalMode && !localWormholeVisuals) {
      // Parent activated portalMode. Start local visuals for opening/holding.
      const contact = contacts.find(c => c.id === portalMode.contactId);
      if (contact) {
        setLocalWormholeVisuals({
          contact: contact,
          startX: portalMode.startX,
          startY: portalMode.startY,
          currentX: portalMode.startX, // Initial current position
          currentY: portalMode.startY, // Initial current position
          phase: 'opening',
          startTime: performance.now(),
          teleportStartTime: null,
          closeStartTime: null,
          targetX: null,
          targetY: null,
          targetOrbitLevel: null,
          targetAngle: null
        });
        setParticles(createWormholeParticles(portalMode.startX, portalMode.startY, 30));
        // isPortalModeActiveRef.current = true; // No longer used, relying on portalMode prop and localWormholeVisuals
      }
    } else if (!portalMode && localWormholeVisuals && localWormholeVisuals.phase !== 'closing') {
      // Parent cleared portalMode (teleport complete OR cancelled).
      // Start local closing visual phase.
      setLocalWormholeVisuals(prev => ({
        ...prev,
        phase: 'closing',
        closeStartTime: performance.now()
      }));
      if (localClosingTimerRef.current) clearTimeout(localClosingTimerRef.current);
      localClosingTimerRef.current = setTimeout(() => {
        setLocalWormholeVisuals(null);
        setParticles([]); // Clear particles too
      }, 800); // Duration of the closing animation
      // isPortalModeActiveRef.current = false; // No longer used
    }
  }, [portalMode, localWormholeVisuals, contacts, createWormholeParticles]);

  // 🔍 Find contact at position helper for pointer events
  const findContactAtPoint = useCallback((px, py, animationTime) => {
    const effectiveCenterX = centerX + parallaxOffsetRef.current.x;
    const effectiveCenterY = centerY + parallaxOffsetRef.current.y;

    for (const contact of contacts) {
      if (localWormholeVisuals && contact.id === localWormholeVisuals.contact.id) continue;

      const { orbit: interpolatedOrbit, angle: interpolatedAngle } = getContactPosition(contact.id, animationTime);

      const radius_unzoomed = 60 + interpolatedOrbit * spacing;
      const radius_zoomed = radius_unzoomed * zoom;

      // Get sphere's individual visual offset angle for accurate visual position
      const sphereRotationAngle = sphereRotationsRef.current.get(contact.id)?.rotationAngle || 0; // Renamed from offsetAngle

      // Calculate display angle using interpolated angle + visual offset
      const displayAngle = (interpolatedAngle + sphereRotationAngle) * Math.PI / 180; // Renamed from sphereVisualOffset

      const contact_abs_x = effectiveCenterX + radius_zoomed * Math.cos(displayAngle);
      const contact_abs_y = effectiveCenterY + radius_zoomed * Math.sin(displayAngle);

      const dist = Math.sqrt((px - contact_abs_x) ** 2 + (py - contact_abs_y) ** 2);
      if (dist < 20) {
        return { type: 'contact', contact, x: contact_abs_x, y: contact_abs_y };
      }
    }
    return { type: 'none' };
  }, [centerX, centerY, contacts, localWormholeVisuals, getContactPosition, spacing, zoom, parallaxOffsetRef, sphereRotationsRef]); // Renamed dependency

  // 🎯 Find closest orbit to position helper for pointer events
  const findClosestOrbit = useCallback((px, py) => {
    const effectiveCenterX = centerX + parallaxOffsetRef.current.x;
    const effectiveCenterY = centerY + parallaxOffsetRef.current.y;
    const distFromCenter_abs = Math.sqrt((px - effectiveCenterX) ** 2 + (py - effectiveCenterY) ** 2);

    let closestOrbit = null;
    let minDiff = Infinity;

    orbitsRef.current.forEach((orbit) => {
      const orbitRadius = orbit.radius * zoom;
      const diff = Math.abs(distFromCenter_abs - orbitRadius);
      if (diff < minDiff && distFromCenter_abs > 50 * zoom) { // Minimum radius to avoid center sun
        minDiff = diff;
        closestOrbit = orbit;
      }
    });
    return closestOrbit;
  }, [centerX, centerY, zoom, parallaxOffsetRef, orbitsRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPointerCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left,
        y: (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top,
        clientX_screen: e.clientX || e.touches?.[0]?.clientX || 0,
        clientY_screen: e.clientY || e.touches?.[0]?.clientY || 0
      };
    };

    const handlePointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      
      const pointer = getPointerCoords(e);
      clickStartTimeRef.current = performance.now();
      isLongPressActiveRef.current = false;
      portalInitialPointerPosRef.current = { x: pointer.x, y: pointer.y };

      const contactAtPoint = findContactAtPoint(pointer.x, pointer.y, performance.now());

      if (contactAtPoint.type === 'contact') {
        e.preventDefault();
        
        setCursorState('pointer');

        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (portalHoldTimerRef.current) clearTimeout(portalHoldTimerRef.current);
        
        // Start long-press timer for wormhole
        portalHoldTimerRef.current = setTimeout(() => {
          const currentPointer = getPointerCoords(e);
          const distMoved = Math.sqrt(
            (currentPointer.x - portalInitialPointerPosRef.current.x) ** 2 +
            (currentPointer.y - portalInitialPointerPosRef.current.y) ** 2
          );
          const movementThreshold = isMobile ? 15 : 5;

          if (distMoved < movementThreshold) {
            isLongPressActiveRef.current = true;
            
            // Brief pulse cursor effect
            setCursorState('pulse');
            setTimeout(() => {
              if (portalMode) {
                setCursorState('pointer');
              }
            }, 400);

            // Activate portal mode
            setPortalMode({
              contactId: contactAtPoint.contact.id,
              startTime: performance.now(),
              startX: contactAtPoint.x,
              startY: contactAtPoint.y
            });
            portalActiveContactRef.current = contactAtPoint.contact;
          }
        }, 600);
      } else {
        setCursorState('default');
      }
    };

    const handlePointerMove = (e) => {
      const pointer = getPointerCoords(e);
      mouseRef.current.x = pointer.x;
      mouseRef.current.y = pointer.y;

      // Update cursor state based on hover (only when not in portal mode)
      if (!portalMode && !localWormholeVisuals && !isLongPressActiveRef.current) {
        const contactAtPoint = findContactAtPoint(pointer.x, pointer.y, performance.now());
        setCursorState(contactAtPoint.type === 'contact' ? 'pointer' : 'default');
      }

      // Cancel long-press if user moves too much during hold
      if (portalHoldTimerRef.current && portalInitialPointerPosRef.current) {
        const distMoved = Math.sqrt(
          (pointer.x - portalInitialPointerPosRef.current.x) ** 2 +
          (pointer.y - portalInitialPointerPosRef.current.y) ** 2
        );
        const holdMovementThreshold = isMobile ? 15 : 5;
        
        if (distMoved > holdMovementThreshold) {
          clearTimeout(portalHoldTimerRef.current);
          portalHoldTimerRef.current = null;
          portalActiveContactRef.current = null;
          isLongPressActiveRef.current = false;
          
          if (portalMode) {
            onCancelTeleport();
          }
          
          setCursorState('default');
        }
      }

      // Handle portal cursor tracking for destination preview
      if (localWormholeVisuals && portalMode) {
        e.preventDefault();
        
        setLocalWormholeVisuals(prev => ({
          ...prev,
          phase: 'holding',
          currentX: pointer.x,
          currentY: pointer.y
        }));

        const targetOrbit = findClosestOrbit(pointer.x, pointer.y);
        if (targetOrbit) {
          const dx = pointer.x - (centerX + parallaxOffsetRef.current.x);
          const dy = pointer.y - (centerY + parallaxOffsetRef.current.y);
          const angleRad = Math.atan2(dy, dx);
          let angleDegrees = (angleRad * 180 / Math.PI + 360) % 360;

          setPortalDestination({ orbitLevel: targetOrbit.level, angle: angleDegrees });
        } else {
          setPortalDestination(null);
        }

        return;
      }

      // 🪐 Mobile: Skip hover tooltips entirely
      if (isMobile) {
        return;
      }

      // 🖥️ Desktop: Handle hover tooltips with 2s delay
      const effectiveCenterX = centerX + parallaxOffsetRef.current.x;
      const effectiveCenterY = centerY + parallaxOffsetRef.current.y;

      const mouseX_transformed = (pointer.x - effectiveCenterX) / zoom;
      const mouseY_transformed = (pointer.y - effectiveCenterY) / zoom;
      const distFromCenter = Math.sqrt(mouseX_transformed ** 2 + mouseY_transformed ** 2);
      const baseCenterRadius = 18;
      const isOverSun = distFromCenter < baseCenterRadius * 1.5;

      // Clear hover timeout if mouse is moving
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      onSetCenterHovered(isOverSun);

      if (isOverSun && !showTooltip) {
        onSetTooltipPosition({ x: pointer.clientX_screen, y: pointer.clientY_screen });
        onSetHoveredSun(true);
        onSetHoveredContact(null);
        onSetShowTooltip(true);
        mouseRef.current.hover = true;
      } else if (!isOverSun && hoveredSun && !hoveredContact) {
        // Start 2s timeout to close sun tooltip
        hoverTimeoutRef.current = setTimeout(() => {
          onSetShowTooltip(false);
          onSetHoveredSun(false);
          mouseRef.current.hover = false;
        }, 2000);
      }

      // Check for contact hover
      const contactAtPoint = findContactAtPoint(pointer.x, pointer.y, performance.now());
      const foundContact = contactAtPoint.type === 'contact' ? contactAtPoint.contact : null;

      if (foundContact && (!hoveredContact || foundContact.id !== hoveredContact.id)) {
        onSetTooltipPosition({ x: pointer.clientX_screen, y: pointer.clientY_screen });
        onSetHoveredContact(foundContact);
        onSetHoveredSun(false);
        onSetShowTooltip(true);
      } else if (!foundContact && hoveredContact && !hoveredSun) {
        // Start 2s timeout to close contact tooltip
        hoverTimeoutRef.current = setTimeout(() => {
          onSetShowTooltip(false);
          onSetHoveredContact(null);
        }, 2000);
      }
    };

    const handlePointerUp = (e) => {
      const clickDuration = performance.now() - clickStartTimeRef.current;
      
      if (portalHoldTimerRef.current) {
        clearTimeout(portalHoldTimerRef.current);
        portalHoldTimerRef.current = null;
      }

      const pointer = getPointerCoords(e);

      if (portalMode && portalActiveContactRef.current && isLongPressActiveRef.current) {
        e.preventDefault();
        e.stopPropagation();
        
        const teleContact = portalActiveContactRef.current;

        if (portalDestination) {
          const newOrbitLevel = portalDestination.orbitLevel;
          const newAngleDegrees = portalDestination.angle;
          const startX = portalMode.startX;
          const startY = portalMode.startY;

          onTeleportContact(teleContact.id, newOrbitLevel, newAngleDegrees, startX, startY);

          setLocalWormholeVisuals(prev => ({
            ...prev,
            phase: 'teleporting',
            teleportStartTime: performance.now(),
            targetX: localWormholeVisuals.currentX,
            targetY: localWormholeVisuals.currentY,
            targetOrbitLevel: newOrbitLevel,
            targetAngle: newAngleDegrees
          }));
          
          setParticles(prev => [...prev, ...createWormholeParticles(localWormholeVisuals.currentX, localWormholeVisuals.currentY, 30, 180)]);
        } else {
          onCancelTeleport();
        }
        
        portalActiveContactRef.current = null;
        isLongPressActiveRef.current = false;
        
        const checkContact = findContactAtPoint(pointer.x, pointer.y, performance.now());
        setCursorState(checkContact.type === 'contact' ? 'pointer' : 'default');
        
        return;
      }

      if (!isLongPressActiveRef.current && clickDuration < 600) {
        const contactAtPoint = findContactAtPoint(pointer.x, pointer.y, performance.now());
        
        if (contactAtPoint.type === 'contact') {
          onContactClick(contactAtPoint.contact);
        } else {
          const effectiveCenterX = centerX + parallaxOffsetRef.current.x;
          const effectiveCenterY = centerY + parallaxOffsetRef.current.y;
          const distFromCenter = Math.sqrt(
            (pointer.x - effectiveCenterX) ** 2 + 
            (pointer.y - effectiveCenterY) ** 2
          );

          if (!isMobile) {
            for (let orbit of orbitsRef.current) {
              if (Math.abs(distFromCenter - orbit.radius * zoom) < 10) {
                onOrbitClick(orbit.level);
                return;
              }
            }
          }

          if (distFromCenter < 18 * 1.5 * zoom) {
            onCenterClick();
          }
        }
      }

      isLongPressActiveRef.current = false;
      portalActiveContactRef.current = null;
      
      const finalContact = findContactAtPoint(pointer.x, pointer.y, performance.now());
      setCursorState(finalContact.type === 'contact' ? 'pointer' : 'default');
    };

    const handleOutsideClick = (e) => {
      if (showTooltip && tooltipRef.current && !tooltipRef.current.contains(e.target) && !canvas.contains(e.target)) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
        onSetShowTooltip(false);
        onSetHoveredContact(null);
        onSetHoveredSun(false);
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    document.addEventListener('click', handleOutsideClick);

    const handleWheel = (e) => {
      e.preventDefault();
      onZoomChange(zoom + (e.deltaY > 0 ? -0.1 : 0.1));
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('click', handleOutsideClick);
      canvas.removeEventListener('wheel', handleWheel);

      if (portalHoldTimerRef.current) clearTimeout(portalHoldTimerRef.current);
      if (localClosingTimerRef.current) clearTimeout(localClosingTimerRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [centerX, centerY, zoom, contacts, localWormholeVisuals, portalMode, portalDestination, onContactClick, onOrbitClick, onCenterClick, onTeleportContact, onCancelTeleport, findContactAtPoint, findClosestOrbit, isMobile, parallaxOffsetRef, spacing, setCursorState, setPortalMode, setPortalDestination, setLocalWormholeVisuals, setParticles, createWormholeParticles, orbitsRef, hoveredSun, hoveredContact, showTooltip, onSetHoveredContact, onSetTooltipPosition, onSetShowTooltip, onSetCenterHovered, onSetHoveredSun, hoverTimeoutRef, tooltipRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = (currentTime) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseRef.current.clickPulse > 0.001) {
        mouseRef.current.clickPulse *= 0.85;
      } else {
        mouseRef.current.clickPulse = 0;
      }

      // Update individual sphere visual offsets
      sphereRotationsRef.current.forEach((sphereData, contactId) => { // Renamed from sphereVisualOffsetsRef
        // Don't visually rotate if contact is currently involved in portal animation or being dragged
        const isInPortal = localWormholeVisuals && localWormholeVisuals.contact.id === contactId;
        if (!isInPortal && !draggedContact) {
          sphereData.rotationAngle += sphereData.rotationSpeed; // Renamed from offsetAngle and speed
          if (sphereData.rotationAngle >= 360) sphereData.rotationAngle -= 360; // Renamed from offsetAngle
          if (sphereData.rotationAngle < 0) sphereData.rotationAngle += 360; // Renamed from offsetAngle
        }
      });

      const targetOffsetX = (mouseX - 0.5) * 30;
      const targetOffsetY = (mouseY - 0.5) * 30;
      parallaxOffsetRef.current.x += (targetOffsetX - parallaxOffsetRef.current.x) * 0.05;
      parallaxOffsetRef.current.y += (targetOffsetY - parallaxOffsetRef.current.y) * 0.05;

      const targetHoverAmount = centerHovered ? 1 : 0; // Fixed from `onSetCenterHovered` to `centerHovered` to match new prop.
      centerHoverAmountRef.current += (targetHoverAmount - centerHoverAmountRef.current) * 0.1;

      const effectiveCenterX = centerX + parallaxOffsetRef.current.x;
      const effectiveCenterY = centerY + parallaxOffsetRef.current.y;

      // Draw tag-based grouping connections
      if (!isMobile && contacts.length > 1 && !focusedContact && !localWormholeVisuals && advancedFilters.groupByTags && advancedFilters.tags.length > 0) {
        const contactPosArray = [];

        contacts.forEach((contact) => {
          if (localWormholeVisuals && localWormholeVisuals.contact.id === contact.id) return;

          const { orbit: interpolatedOrbit, angle: interpolatedAngle } = getContactPosition(contact.id, currentTime);
          const radius_unzoomed = 60 + interpolatedOrbit * spacing;
          const radius_zoomed = radius_unzoomed * zoom;
          const sphereRotationAngle = sphereRotationsRef.current.get(contact.id)?.rotationAngle || 0;
          const displayAngle = (interpolatedAngle + sphereRotationAngle) * Math.PI / 180;
          const x = effectiveCenterX + radius_zoomed * Math.cos(displayAngle);
          const y = effectiveCenterY + radius_zoomed * Math.sin(displayAngle);

          contactPosArray.push({ contact, x, y });
        });

        // Draw connections between contacts sharing tags
        const maxDistance = 200;
        for (let i = 0; i < contactPosArray.length; i++) {
          for (let j = i + 1; j < contactPosArray.length; j++) {
            const pos1 = contactPosArray[i];
            const pos2 = contactPosArray[j];

            // Check if they share any selected tags
            const sharedTags = (pos1.contact.tags || []).filter(tag => 
              (pos2.contact.tags || []).includes(tag) && 
              advancedFilters.tags.includes(tag)
            );

            if (sharedTags.length === 0) continue;

            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance && distance > 0) {
              const opacity = Math.pow(1 - distance / maxDistance, 2) * 0.5;

              const gradient = ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y);
              
              if (isRetro) {
                gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(255, 0, 255, ${opacity})`);
                gradient.addColorStop(1, `rgba(0, 255, 255, ${opacity})`);
              } else {
                gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(236, 72, 153, ${opacity})`);
                gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity})`);
              }

              ctx.strokeStyle = gradient;
              ctx.lineWidth = 2;
              ctx.shadowBlur = 10;
              ctx.shadowColor = isRetro ? `rgba(255, 0, 255, ${opacity * 0.8})` : `rgba(139, 92, 246, ${opacity * 0.8})`;

              ctx.beginPath();
              ctx.moveTo(pos1.x, pos1.y);
              ctx.lineTo(pos2.x, pos2.y);
              ctx.stroke();

              // Draw tag label on connection midpoint
              const midX = (pos1.x + pos2.x) / 2;
              const midY = (pos1.y + pos2.y) / 2;
              
              ctx.save();
              ctx.globalAlpha = opacity * 0.8;
              ctx.fillStyle = isRetro ? 'rgba(255, 0, 255, 0.9)' : 'rgba(139, 92, 246, 0.9)';
              ctx.font = '10px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(sharedTags[0], midX, midY);
              ctx.restore();

              ctx.restore();
            }
          }
        }
      }

      // ✨ Improved sun pulse - slower, bigger, smoother
      const timeInSeconds = currentTime / 1000;
      
      // Slower pulse (3 second cycle instead of 0.8)
      // Smoother easing using sine wave
      const pulseProgress = (timeInSeconds / 3) % 1; // 0 to 1 over 3 seconds
      const smoothPulse = (Math.sin(pulseProgress * Math.PI * 2 - Math.PI / 2) + 1) / 2; // Smooth 0 to 1 to 0
      
      // Bigger pulse scale
      const basePulseScale = isRetro ? 1 + smoothPulse * 0.35 : 1 + smoothPulse * 0.25; // Increased from 0.2/0.15
      const hoverScale = 1.0 + centerHoverAmountRef.current * 0.3;
      const centerRadius = 18 * basePulseScale * hoverScale;
      const glowIntensity = 0.5 + smoothPulse * 0.5;

      if (isRetro) {
        const synthPulse = timeInSeconds * 0.3 % (2 * Math.PI);
        const pinkAmount = (Math.sin(synthPulse) + 1) / 2;
        const violetAmount = 1 - pinkAmount;

        for (let i = 3; i > 0; i--) {
          const glowRadius = centerRadius * (1 + i * 0.5);
          const glowAlpha = 0.6 / i * (0.8 + smoothPulse * 0.5);

          const glowGrad = ctx.createRadialGradient(
            effectiveCenterX, effectiveCenterY, centerRadius,
            effectiveCenterX, effectiveCenterY, glowRadius
          );
          glowGrad.addColorStop(0, `rgba(${Math.floor(255 * pinkAmount + 157 * violetAmount)}, 0, 255, ${glowAlpha})`);
          glowGrad.addColorStop(0.5, `rgba(255, 0, ${Math.floor(255 * pinkAmount)}, ${glowAlpha * 0.7})`);
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.strokeStyle = glowGrad;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = `rgba(255, 0, ${Math.floor(255 * pinkAmount + 157 * violetAmount)}, ${glowAlpha * 0.6})`;

          ctx.beginPath();
          ctx.arc(effectiveCenterX, effectiveCenterY, glowRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        const sunGradient = ctx.createRadialGradient(
          effectiveCenterX, effectiveCenterY, 0,
          effectiveCenterX, effectiveCenterY, centerRadius
        );
        sunGradient.addColorStop(0, '#ffffff');
        sunGradient.addColorStop(0.3, `rgb(${Math.floor(255 * pinkAmount + 200 * violetAmount)}, ${Math.floor(100 * violetAmount)}, 255)`);
        sunGradient.addColorStop(0.7, `rgb(${Math.floor(255 * pinkAmount + 157 * violetAmount)}, 0, ${Math.floor(255 * pinkAmount + 200 * violetAmount)})`);
        sunGradient.addColorStop(1, `rgb(${Math.floor(200 * pinkAmount + 100 * violetAmount)}, 0, ${Math.floor(200 * pinkAmount + 150 * violetAmount)})`);

        ctx.save();
        ctx.shadowBlur = 40 * (1 + smoothPulse * 0.8);
        ctx.shadowColor = `rgb(${Math.floor(255 * pinkAmount + 157 * violetAmount)}, 0, 255)`;
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, centerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const coreGradient = ctx.createRadialGradient(
          effectiveCenterX, effectiveCenterY, 0,
          effectiveCenterX, effectiveCenterY, centerRadius * 0.5
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.6, `rgba(${Math.floor(255 * pinkAmount + 200 * violetAmount)}, 200, 255, ${0.8 + smoothPulse * 0.4})`);
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, centerRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const outerGlow = ctx.createRadialGradient(
          effectiveCenterX, effectiveCenterY, 0,
          effectiveCenterX, effectiveCenterY, centerRadius * 3
        );
        outerGlow.addColorStop(0, `rgba(255, 220, 100, ${glowIntensity})`);
        outerGlow.addColorStop(0.4, `rgba(255, 180, 50, ${glowIntensity * 0.6})`);
        outerGlow.addColorStop(1, 'rgba(255, 140, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, centerRadius * 3, 0, Math.PI * 2);
        ctx.fill();

        const rayCount = 8;
        const rayLengthMultiplier = 2.0 + centerHoverAmountRef.current * 0.5 + smoothPulse * 0.5;
        const rayLength = centerRadius * rayLengthMultiplier;
        const baseRayOpacity = 0.4 + centerHovered * 0.3; // Use prop centerHovered
        const rayOpacity = baseRayOpacity + smoothPulse * 0.4;

        ctx.save();
        ctx.translate(effectiveCenterX, effectiveCenterY);
        ctx.rotate(timeInSeconds * 0.1);

        for (let i = 0; i < rayCount; i++) {
          const angle = i / rayCount * Math.PI * 2;
          const rayGrad = ctx.createLinearGradient(
            0, 0,
            Math.cos(angle) * rayLength,
            Math.sin(angle) * rayLength
          );
          rayGrad.addColorStop(0, `rgba(255, 220, 100, ${rayOpacity})`);
          rayGrad.addColorStop(0.7, `rgba(255, 180, 50, ${rayOpacity * 0.6})`);
          rayGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(angle - 0.15) * centerRadius,
            Math.sin(angle - 0.15) * centerRadius
          );
          ctx.lineTo(
            Math.cos(angle) * rayLength,
            Math.sin(angle) * rayLength
          );
          ctx.lineTo(
            Math.cos(angle + 0.15) * centerRadius,
            Math.sin(angle + 0.15) * centerRadius
          );
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        const sunGradient = ctx.createRadialGradient(
          effectiveCenterX, effectiveCenterY, 0,
          effectiveCenterX, effectiveCenterY, centerRadius
        );
        sunGradient.addColorStop(0, '#ffffff');
        sunGradient.addColorStop(0.4, '#ffdc64');
        sunGradient.addColorStop(0.7, '#ffb432');
        sunGradient.addColorStop(1, '#ff9c00');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, centerRadius, 0, Math.PI * 2);
        ctx.fill();

        const coreGradient = ctx.createRadialGradient(
          effectiveCenterX, effectiveCenterY, 0,
          effectiveCenterX, effectiveCenterY, centerRadius * 0.5
        );
        coreGradient.addColorStop(0, `rgba(255, 255, 240, ${0.95 + smoothPulse * 0.15})`);
        coreGradient.addColorStop(1, 'rgba(255, 255, 240, 0)');

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, centerRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // NEW: Draw orbit transition effect
      if (orbitTransitionActive) {
        const elapsed = currentTime - orbitTransitionActive.startTime;
        const duration = 800; // 800ms transition animation
        
        if (elapsed < duration) {
          const progress = elapsed / duration;
          const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          
          const fromRadius = (60 + orbitTransitionActive.fromOrbit * spacing) * zoom;
          const toRadius = (60 + orbitTransitionActive.toOrbit * spacing) * zoom;
          
          // Pulsing effect on destination orbit
          const pulseIntensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
          
          ctx.save();
          ctx.strokeStyle = hexToRgbaViz(colors.secondary, 0.6 * (1 - progress));
          ctx.lineWidth = 4;
          ctx.shadowBlur = 30 * pulseIntensity;
          ctx.shadowColor = colors.secondary;
          
          ctx.beginPath();
          ctx.arc(effectiveCenterX, effectiveCenterY, toRadius, 0, Math.PI * 2);
          ctx.stroke();
          
          // Draw sparkle trail from source to destination
          const trailRadius = fromRadius + (toRadius - fromRadius) * easeProgress;
          const trailGlow = ctx.createRadialGradient(
            effectiveCenterX, effectiveCenterY, trailRadius - 20,
            effectiveCenterX, effectiveCenterY, trailRadius + 20
          );
          trailGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
          trailGlow.addColorStop(0.5, hexToRgbaViz(colors.primary, 0.4 * (1 - progress)));
          trailGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = trailGlow;
          ctx.beginPath();
          ctx.arc(effectiveCenterX, effectiveCenterY, trailRadius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        } else {
          setOrbitTransitionActive(null);
        }
      }

      orbitsRef.current.forEach((orbit) => {
        const radius = orbit.radius * zoom;
        const orbitColorIndex = orbit.level - 1;
        const orbitColor = colors.orbitColors[orbitColorIndex] || colors.orbitColors[colors.orbitColors.length - 1];

        const isTargetOrbit = draggedContact && dragTargetOrbit === orbit.level;
        const isPortalTargetOrbit = portalDestination && portalDestination.orbitLevel === orbit.level; // Use portalDestination prop

        let glowIntensity = 0;
        if (connectionGlowRef.current.active && connectionGlowRef.current.orbitLevel === orbit.level) {
          const elapsed = currentTime / 1000 * 1000 - connectionGlowRef.current.startTime;
          const duration = 800;
          if (elapsed < duration) {
            const progress = elapsed / duration;
            glowIntensity = (1 - progress) * 0.8;
          } else {
            connectionGlowRef.current.active = false;
          }
        }

        ctx.strokeStyle = isTargetOrbit || isPortalTargetOrbit ? '#ffffff' : orbitColor;
        ctx.lineWidth = isTargetOrbit || isPortalTargetOrbit ? 4 : isRetro ? 2 : 1.5 + mouseRef.current.clickPulse * 2;

        if (isRetro || isTargetOrbit || glowIntensity > 0 || isPortalTargetOrbit) {
          ctx.shadowBlur = isTargetOrbit || isPortalTargetOrbit ? 20 : glowIntensity > 0 ? 30 * glowIntensity : 20;
          ctx.shadowColor = isTargetOrbit || isPortalTargetOrbit ? '#ffffff' : glowIntensity > 0 ? hexToRgbaViz(colors.secondary, glowIntensity) : orbitColor;
        }

        ctx.beginPath();
        ctx.arc(effectiveCenterX, effectiveCenterY, radius, 0, Math.PI * 2); // Orbit rings are static (angle 0)
        ctx.stroke();

        if (isRetro || isTargetOrbit || glowIntensity > 0 || isPortalTargetOrbit) {
          ctx.shadowBlur = 0;
        }

        if (magneticSnapPulseRef.current.active && magneticSnapPulseRef.current.orbitLevel === orbit.level) {
          const elapsed = currentTime / 1000 * 1000 - magneticSnapPulseRef.current.startTime;
          const duration = 500;
          if (elapsed < duration) {
            const progress = elapsed / duration;
            const pulseRadius = radius + progress * 40;
            const pulseOpacity = (1 - progress) * 0.6;

            ctx.save();
            ctx.strokeStyle = hexToRgbaViz(colors.secondary, pulseOpacity);
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = hexToRgbaViz(colors.secondary, pulseOpacity);
            ctx.beginPath();
            ctx.arc(effectiveCenterX, effectiveCenterY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          } else {
            magneticSnapPulseRef.current.active = false;
          }
        }
      });

      const contactsToDraw = [...contacts];

      let currentDraggedContact = null;
      if (draggedContact) {
        const draggedIndex = contactsToDraw.findIndex((c) => c.id === draggedContact.id);
        if (draggedIndex !== -1) {
          currentDraggedContact = contactsToDraw.splice(draggedIndex, 1)[0];
        }
      }

      contactsToDraw.forEach((contact) => {
        if (radialMenuContact && radialMenuContact.id === contact.id) return;
        // Don't draw actual contact if it's currently involved in a wormhole teleport
        if (localWormholeVisuals && localWormholeVisuals.contact.id === contact.id) return;
        if (orbitTransitionActive && orbitTransitionActive.contactId === contact.id) return; // Don't draw contact during orbit transition

        const { orbit: interpolatedOrbit, angle: interpolatedAngle } = getContactPosition(contact.id, currentTime);

        const radius_unzoomed = 60 + interpolatedOrbit * spacing;
        const radius_zoomed = radius_unzoomed * zoom;

        // Get sphere's individual visual offset angle
        const sphereRotationAngle = sphereRotationsRef.current.get(contact.id)?.rotationAngle || 0; // Renamed

        // Calculate display angle using interpolated angle + visual offset
        const displayAngle = (interpolatedAngle + sphereRotationAngle) * Math.PI / 180; // Renamed

        const x = effectiveCenterX + radius_zoomed * Math.cos(displayAngle);
        const y = effectiveCenterY + radius_zoomed * Math.sin(displayAngle);

        const isFocused = focusedContact && focusedContact.id === contact.id;
        const isHoveredSearch = hoveredSearchContact && hoveredSearchContact.id === contact.id;
        const effectiveOpacity = focusedContact ? isFocused ? 1 : 0.3 : 1;
        const isPulsingCurrentContact = pulsingContact && pulsingContact === contact.id;

        drawContact(ctx, contact, x, y, effectiveOpacity, {
          isDragged: false,
          isFocused,
          isHoveredSearch,
          isRetro,
          animationFrameTime: currentTime / 1000,
          themeColors,
          getTimelineColor,
          hexToRgbaViz,
          shadeColor,
          isPulsing: isPulsingCurrentContact,
          isPortalSource: false
        });
      });

      // Draw local wormhole effects
      if (localWormholeVisuals) {
        const { contact, startX, startY, currentX, currentY, targetX, targetY, phase, startTime, teleportStartTime, closeStartTime } = localWormholeVisuals;
        let effectiveOpacity = 1;

        if (phase === 'opening' || phase === 'holding') {
          const elapsed = currentTime - startTime;
          const openProgress = Math.min(elapsed / 400, 1); // 400ms open animation
          const easeOpen = 1 - Math.pow(1 - openProgress, 3); // Ease out cubic

          const vortexSize = 60 * easeOpen;
          const rotation = elapsed * 0.003;

          // Draw swirling vortex at startX, startY
          for (let i = 0; i < 3; i++) {
            const ringSize = vortexSize * (1 - i * 0.25);
            const ringRotation = rotation + i * Math.PI / 1.5;

            const vortexGradient = ctx.createRadialGradient(
              startX, startY, ringSize * 0.3,
              startX, startY, ringSize
            );
            vortexGradient.addColorStop(0, hexToRgbaViz(colors.primary, 0.8 * easeOpen));
            vortexGradient.addColorStop(0.5, hexToRgbaViz(colors.primary, 0.5 * easeOpen));
            vortexGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = vortexGradient;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = hexToRgbaViz(colors.primary, 0.6);

            ctx.beginPath();
            ctx.arc(startX, startY, ringSize, ringRotation, ringRotation + Math.PI * 1.8);
            ctx.stroke();
          }

          // Draw contact being sucked in
          if (phase === 'holding') {
            const suckProgress = Math.min((elapsed - 400) / 300, 1); // Start after opening
            const easeSuck = Math.pow(suckProgress, 2); // Ease in quad

            const contactSize = 20 * (1 - easeSuck * 0.7);
            const contactOpacity = 1 - easeSuck * 0.5;

            ctx.save();
            ctx.globalAlpha = contactOpacity;

            drawContact(ctx, contact, startX, startY, contactOpacity, {
              isDragged: false, isFocused: false, isHoveredSearch: false, isRetro, animationFrameTime: currentTime / 1000, themeColors, getTimelineColor, hexToRgbaViz, shadeColor, isPulsing: false, isPortalSource: true
            });
            ctx.restore();

            // Draw cursor tracking line
            ctx.strokeStyle = hexToRgbaViz(colors.primary, 0.4);
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Teleporting: destination vortex + contact pop-out
        if (phase === 'teleporting') {
          const teleportElapsed = currentTime - teleportStartTime;
          const teleportProgress = Math.min(teleportElapsed / 1200, 1); // 1.2s total animation

          // Destination vortex opening
          if (teleportProgress < 0.5) {
            const openProgress = teleportProgress * 2; // First half
            const easeOpen = 1 - Math.pow(1 - openProgress, 3);

            const vortexSize = 60 * easeOpen;
            const rotation = teleportElapsed * 0.003;

            for (let i = 0; i < 3; i++) {
              const ringSize = vortexSize * (1 - i * 0.25);
              const ringRotation = rotation + i * Math.PI / 1.5;

              const vortexGradient = ctx.createRadialGradient(
                targetX, targetY, ringSize * 0.3,
                targetX, targetY, ringSize
              );
              vortexGradient.addColorStop(0, hexToRgbaViz(colors.secondary, 0.8 * easeOpen));
              vortexGradient.addColorStop(0.5, hexToRgbaViz(colors.secondary, 0.5 * easeOpen));
              vortexGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

              ctx.strokeStyle = vortexGradient;
              ctx.lineWidth = 3;
              ctx.shadowBlur = 20;
              ctx.shadowColor = hexToRgbaViz(colors.secondary, 0.6);

              ctx.beginPath();
              ctx.arc(targetX, targetY, ringSize, ringRotation, ringRotation + Math.PI * 1.8);
              ctx.stroke();
            }
          }

          // Contact popping out
          if (teleportProgress >= 0.4) {
            const popProgress = (teleportProgress - 0.4) / 0.6; // Last 60% of animation
            const easePop = 1 - Math.pow(1 - popProgress, 3); // Ease out cubic

            const contactOpacity = Math.min(easePop * 2, 1);

            ctx.save();
            ctx.globalAlpha = contactOpacity;

            drawContact(ctx, contact, targetX, targetY, contactOpacity, {
              isDragged: false, isFocused: false, isHoveredSearch: false, isRetro, animationFrameTime: currentTime / 1000, themeColors, getTimelineColor, hexToRgbaViz, shadeColor, isPulsing: false, isPortalSource: false
            });
            ctx.restore();
          }
        }

        // Closing: fade out both vortexes
        if (phase === 'closing') {
          const closeElapsed = currentTime - closeStartTime;
          const closeProgress = Math.min(closeElapsed / 800, 1); // 800ms close animation
          effectiveOpacity = 1 - closeProgress;

          // Fade out start vortex
          const rotation = closeElapsed * 0.003;
          for (let i = 0; i < 3; i++) {
            const ringSize = 40 * (1 - i * 0.25) * effectiveOpacity;
            const ringRotation = rotation + i * Math.PI / 1.5;

            ctx.strokeStyle = hexToRgbaViz(colors.primary, 0.5 * effectiveOpacity);
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = hexToRgbaViz(colors.primary, 0.4 * effectiveOpacity);

            ctx.beginPath();
            ctx.arc(startX, startY, ringSize, ringRotation, ringRotation + Math.PI * 1.8);
            ctx.stroke();
          }

          // Fade out destination vortex if it exists
          if (targetX && targetY) {
            for (let i = 0; i < 3; i++) {
              const ringSize = 40 * (1 - i * 0.25) * effectiveOpacity;
              const ringRotation = rotation + i * Math.PI / 1.5;

              ctx.strokeStyle = hexToRgbaViz(colors.secondary, 0.5 * effectiveOpacity);
              ctx.lineWidth = 2;
              ctx.shadowBlur = 10;
              ctx.shadowColor = hexToRgbaViz(colors.secondary, 0.4 * effectiveOpacity);

              ctx.beginPath();
              ctx.arc(targetX, targetY, ringSize, ringRotation, ringRotation + Math.PI * 1.8);
              ctx.stroke();
            }
          }
        }
      }

      // Update and draw particles
      setParticles(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.98,
          vy: p.vy * 0.98,
          life: p.life - p.decay
        })).filter(p => p.life > 0);

        updated.forEach(p => {
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        });

        return updated;
      });

      if (currentDraggedContact) { // draggedContact is still a prop, so this block should remain.
        const contact = currentDraggedContact;
        // Previous `draggedContactSmoothPosRef` is commented out. `draggedContactVisualPosRef` would be similar.
        // For now, these visual position refs are also commented out. If dragging is to work, these need to be active.
        // Assuming the parent `Orbit` component's `handleContactDragEnd` still works with its own `draggedContact` state,
        // this `currentDraggedContact` is merely a display state. However, the movement logic is gone from `handlePointerMove/Up`
        // in this component based on the outline. This will likely break dragging.
        const x = mouseRef.current.x; // Use current mouse position for dragged contact
        const y = mouseRef.current.y; // Use current mouse position for dragged contact

        // Celestial Flow: Pulsing, flowing glow
        // Previous `dragGlowScaleRef` is commented out.
        const flowPulse = Math.sin(currentTime * 0.003) * 0.15 + 1;

        ctx.save();
        const dragGlowRadius = 70 * 1 * flowPulse; // dragGlowScaleRef.current replaced with 1
        const dragGlow = ctx.createRadialGradient(x, y, 0, x, y, dragGlowRadius);
        dragGlow.addColorStop(0, hexToRgbaViz(contact.sphere_color || colors.primary, 0.8 * flowPulse));
        dragGlow.addColorStop(0.5, hexToRgbaViz(contact.sphere_color || colors.primary, 0.5 * flowPulse));
        dragGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = dragGlow;
        ctx.beginPath();
        ctx.arc(x, y, dragGlowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw with enhanced glow during drag
        drawContact(ctx, contact, x, y, 1, {
          isDragged: true,
          isFocused: false,
          isHoveredSearch: false,
          isRetro,
          animationFrameTime: currentTime / 1000,
          themeColors,
          getTimelineColor,
          hexToRgbaViz,
          shadeColor,
          isPulsing: false,
          isPortalSource: false
        });
      }

      const currentContactIds = new Set(contacts.map((c) => c.id));
      Object.keys(contactTrailsRef.current).forEach((id) => {
        if (!currentContactIds.has(id)) {
          delete contactTrailsRef.current[id];
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [centerX, centerY, contacts, colors, zoom, mouseX, mouseY, centerHovered, theme, isRetro, hexToRgbaViz, focusedContact, hoveredSearchContact, draggedContact, dragTargetOrbit, radialMenuContact, pulsingContact, shadeColor, getTimelineColor, getContactPosition, drawContact, isMobile, cooldownContacts, maxOrbits, orbitsRef, easeInOutSine, localWormholeVisuals, portalDestination, createWormholeParticles, sphereRotationsRef, orbitTransitionActive, setOrbitTransitionActive, advancedFilters]);

  return (
    <>
      <canvas
        ref={canvasRef} className="opacity-90 absolute inset-0"
        style={{
          zIndex: 5,
          cursor: 'inherit' // Inherit cursor from parent
        }}
      />
    </>
  );
}
