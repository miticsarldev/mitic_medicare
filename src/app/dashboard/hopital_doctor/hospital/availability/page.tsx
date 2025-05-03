'use client';
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useTheme } from 'next-themes';

type DoctorAvailability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const AvailabilitySettings = () => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [isRecurring, setIsRecurring] = useState(true);
  const [previewSlots, setPreviewSlots] = useState<string[]>([]);
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const daysOfWeek = [
    { id: 1, name: 'Lundi' },
    { id: 2, name: 'Mardi' },
    { id: 3, name: 'Mercredi' },
    { id: 4, name: 'Jeudi' },
    { id: 5, name: 'Vendredi' },
    { id: 6, name: 'Samedi' },
    { id: 0, name: 'Dimanche' },
  ];

  // Charger les disponibilités du médecin
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await fetch('/api/hospital_doctor/doctor/availability');
        const data = await response.json();
        if (response.ok) {
          setDoctorAvailabilities(data);
          if (data.length > 0) {
            setStartTime(data[0].startTime);
            setEndTime(data[0].endTime);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor availabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, []);

  // Génère un aperçu des créneaux
  useEffect(() => {
    const slots: string[] = [];
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    let current = new Date(start);
    while (current < end) {
      const timeStr = current.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      slots.push(timeStr);
      current = new Date(current.getTime() + slotDuration * 60000);
    }

    setPreviewSlots(slots);
  }, [startTime, endTime, slotDuration]);

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
    
    const dayAvailability = doctorAvailabilities.find(da => da.dayOfWeek === dayId);
    if (dayAvailability) {
      setStartTime(dayAvailability.startTime);
      setEndTime(dayAvailability.endTime);
    }
  };

  const handleSubmit = async () => {
    try {
      const datesToSend = isRecurring 
        ? null 
        : specificDates.map(date => date.toISOString().split('T')[0]);

      const response = await fetch('/api/hospital_doctor/doctor/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: isRecurring ? selectedDays : [],
          startTime,
          endTime,
          slotDuration,
          specificDates: datesToSend,
          isRecurring,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert('Créneaux enregistrés avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">Chargement...</div>
      </div>
    );
  }

  const availableDays = daysOfWeek.filter(day => 
    doctorAvailabilities.some(da => da.dayOfWeek === day.id && da.isActive)
  );

  // Styles conditionnels pour le dark mode
  const containerClasses = `min-h-screen p-8 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`;
  const cardClasses = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const buttonClasses = theme === 'dark' 
    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  const activeButtonClasses = theme === 'dark' 
    ? 'bg-blue-700 text-white' 
    : 'bg-blue-600 text-white';
  const inputClasses = theme === 'dark' 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : 'bg-white border-gray-300 text-gray-900';
  const previewSlotClasses = theme === 'dark' 
    ? 'bg-gray-700 border-gray-600' 
    : 'bg-gray-50 border-gray-200';

  return (
    <div className={containerClasses}>
      <div className={`max-w-7xl mx-auto p-6 rounded-lg border ${cardClasses} shadow-lg`}>
        <h1 className="text-2xl font-bold mb-6">Gestion des Créneaux Disponibles</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Récurrente/Spécifique */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsRecurring(true)}
                className={`px-4 py-2 rounded-lg ${isRecurring ? activeButtonClasses : buttonClasses}`}
              >
                Récurrent
              </button>
              <button
                onClick={() => setIsRecurring(false)}
                className={`px-4 py-2 rounded-lg ${!isRecurring ? activeButtonClasses : buttonClasses}`}
              >
                Dates spécifiques
              </button>
            </div>

            {isRecurring ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Jours de disponibilité</h2>
                {availableDays.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableDays.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`py-2 px-3 rounded-lg text-center ${
                          selectedDays.includes(day.id) 
                            ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                            : `${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`
                        }`}
                      >
                        {day.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Aucun jour de disponibilité configuré
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-3">Sélectionnez des dates</h2>
                <div className={theme === 'dark' ? 'rdp-dark' : ''}>
                  <DayPicker
                    mode="multiple"
                    selected={specificDates}
                    onSelect={(dates) => setSpecificDates(dates || [])}
                    fromDate={new Date()}
                    disabled={(date) => {
                      const day = date.getDay();
                      return !availableDays.some(d => d.id === day);
                    }}
                    styles={{
                      day: { margin: '0.1rem' },
                    }}
                    className={`border rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Heures et Créneaux */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Plage horaire</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${inputClasses}`}
                    step="900"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full p-2 border rounded-lg ${inputClasses}`}
                    step="900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Durée des créneaux</h2>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSlotDuration(duration)}
                    className={`py-2 rounded-lg ${
                      slotDuration === duration ? activeButtonClasses : buttonClasses
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Aperçu des créneaux</h2>
              {previewSlots.length > 0 ? (
                <div className={`p-4 rounded-lg max-h-40 overflow-y-auto ${previewSlotClasses}`}>
                  <div className="grid grid-cols-3 gap-2">
                    {previewSlots.map((slot, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded border text-center text-sm ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Configurez une plage horaire pour voir l&apos;aperçu
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={(isRecurring && selectedDays.length === 0) || (!isRecurring && specificDates.length === 0)}
            className={`px-6 py-2 rounded-lg ${
              (isRecurring && selectedDays.length === 0) || (!isRecurring && specificDates.length === 0)
                ? 'bg-gray-400 cursor-not-allowed'
                : activeButtonClasses
            }`}
          >
            Enregistrer les créneaux
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;