import React, { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';

export default function OrbitIntelligence({
  enabled = true,
  testMode = false,
  driftInterval = '12s',
  moveInIfContactedWithin = 1,
  moveOutEvery = 3, // NEW: Every 3 days moves 1 ring out
  maxOrbits = 12,
  allowOverlap = false,
  autoCreateRing = false,
  debugMode = false
}) {
  const queryClient = useQueryClient();
  const lastCheckRef = useRef(new Date());
  const intervalRef = useRef(null);

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
    initialData: []
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const processOrbitDrift = async () => {
    if (!enabled || contacts.length === 0) return;

    const now = new Date();
    const contactsToUpdate = [];

    for (const contact of contacts) {
      // Skip contacts with manual positioning (until they're contacted)
      if (contact.manual_position) {
        if (debugMode) {
          console.log(`⏸️ Skipping ${contact.name} - manual position active`);
        }
        continue;
      }

      // Skip if no last_contacted date
      if (!contact.last_contacted) {
        if (debugMode) {
          console.log(`⏭️ Skipping ${contact.name} - never contacted`);
        }
        continue;
      }

      const lastContactedDate = new Date(contact.last_contacted);
      const daysSinceContact = differenceInDays(now, lastContactedDate);

      // Current orbit level
      const currentOrbit = contact.orbit_level || 6;

      // Base orbit (where they were when last contacted)
      const baseOrbit = contact.orbit_level_at_last_contact || currentOrbit;

      // NEW LOGIC: Calculate target orbit based on 3-day intervals
      // For every 3 days since contact, move 1 ring out
      const ringsToMoveOut = Math.floor(daysSinceContact / moveOutEvery);
      const targetOrbit = Math.min(maxOrbits, baseOrbit + ringsToMoveOut);

      // Check if update is needed
      if (targetOrbit !== currentOrbit) {
        contactsToUpdate.push({
          contact,
          newOrbit: targetOrbit,
          reason: `${daysSinceContact} days since contact → ${ringsToMoveOut} rings out (${moveOutEvery}-day intervals)`
        });
      }
    }

    // Batch update contacts
    if (contactsToUpdate.length > 0) {
      if (debugMode) {
        console.log(`🔄 Updating ${contactsToUpdate.length} contacts:`);
        contactsToUpdate.forEach(({ contact, newOrbit, reason }) => {
          console.log(`  • ${contact.name}: Ring ${contact.orbit_level} → Ring ${newOrbit}`);
          console.log(`    Reason: ${reason}`);
        });
      }

      for (const { contact, newOrbit } of contactsToUpdate) {
        await updateContactMutation.mutateAsync({
          id: contact.id,
          data: {
            orbit_level: newOrbit,
            last_orbit_check: now.toISOString()
          }
        });
      }

      // Dispatch event to trigger visual updates
      window.dispatchEvent(new CustomEvent('orbitIntelligenceUpdate', {
        detail: { updatedCount: contactsToUpdate.length }
      }));
    } else if (debugMode) {
      console.log('✅ All contacts at correct orbit levels');
    }

    lastCheckRef.current = now;
  };

  // Initial check and interval setup
  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    const timer = setTimeout(() => {
      processOrbitDrift();
    }, 2000); // 2 second delay for initial load

    // Set up interval
    const intervalMs = testMode ? 5000 : parseInterval(driftInterval);
    intervalRef.current = setInterval(() => {
      processOrbitDrift();
    }, intervalMs);

    // Listen for manual triggers
    const handleForceCheck = () => {
      console.log('🔔 Force orbit check triggered');
      processOrbitDrift();
    };
    window.addEventListener('forceOrbitCheck', handleForceCheck);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('forceOrbitCheck', handleForceCheck);
    };
  }, [enabled, contacts, driftInterval, testMode, moveOutEvery, maxOrbits, debugMode]);

  // Debug panel
  if (debugMode && enabled) {
    return (
      <div className="fixed bottom-24 left-4 z-50 bg-black/90 border border-white/20 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-bold mb-2">🧠 Orbit Intelligence</h3>
        <div className="text-white/70 text-xs space-y-1">
          <p>Status: <span className="text-green-400">Active</span></p>
          <p>Contacts: {contacts.length}</p>
          <p>Drift Rule: 1 ring per {moveOutEvery} days</p>
          <p>Max Orbits: {maxOrbits}</p>
          <p>Check Interval: {driftInterval}</p>
          <p>Last Check: {lastCheckRef.current.toLocaleTimeString()}</p>
          <button
            onClick={processOrbitDrift}
            className="mt-2 px-3 py-1 bg-purple-600 rounded text-white text-xs"
          >
            Force Check Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function parseInterval(interval) {
  const match = interval.match(/^(\d+)([smh])$/);
  if (!match) return 12000; // Default 12 seconds

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return 12000;
  }
}