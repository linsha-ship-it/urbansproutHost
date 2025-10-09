import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaArrowLeft, FaPlus, FaCalendar, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const MyGardenJournal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [garden, setGarden] = useState([]);
  const [filteredGarden, setFilteredGarden] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const filters = ['All', 'Herbs', 'Fruits', 'Vegetables'];

  // Load garden from database
  useEffect(() => {
    const loadGarden = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/garden', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGarden(data.garden);
            setFilteredGarden(data.garden);
          }
        } else {
          // Fallback to localStorage
          const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`;
          const savedGarden = localStorage.getItem(key);
          if (savedGarden) {
            const gardenData = JSON.parse(savedGarden);
            setGarden(gardenData);
            setFilteredGarden(gardenData);
          }
        }
      } catch (error) {
        console.error('Error loading garden:', error);
        // Fallback to localStorage
        const key = `my_garden_${user?.id || user?.uid || user?.email || 'guest'}`;
        const savedGarden = localStorage.getItem(key);
        if (savedGarden) {
          const gardenData = JSON.parse(savedGarden);
          setGarden(gardenData);
          setFilteredGarden(gardenData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadGarden();
  }, [user]);

  // Load plant images from localStorage
  useEffect(() => {
    const loadPlantImages = () => {
      const key = `plant_images_${user?.id || user?.uid || user?.email || 'guest'}`;
      const savedImages = localStorage.getItem(key);
      if (savedImages) {
        try {
          const images = JSON.parse(savedImages);
          setPlantImages(images);
        } catch (error) {
          console.error('Error loading plant images:', error);
        }
      }
    };

    loadPlantImages();
  }, [user]);

  // Filter plants based on selected filter
  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredGarden(garden);
    } else {
      const filtered = garden.filter(plant => {
        if (typeof plant === 'string') {
          // Handle localStorage fallback
          const name = plant.toLowerCase();
          switch (activeFilter) {
            case 'Herbs':
              return name.includes('basil') || name.includes('mint') || name.includes('oregano') || 
                     name.includes('thyme') || name.includes('rosemary') || name.includes('sage') ||
                     name.includes('cilantro') || name.includes('parsley') || name.includes('dill');
            case 'Fruits':
              return name.includes('tomato') || name.includes('strawberry') || name.includes('berry') ||
                     name.includes('apple') || name.includes('citrus') || name.includes('lemon') ||
                     name.includes('lime') || name.includes('orange');
            case 'Vegetables':
              return name.includes('lettuce') || name.includes('spinach') || name.includes('carrot') ||
                     name.includes('pepper') || name.includes('cucumber') || name.includes('onion') ||
                     name.includes('garlic') || name.includes('broccoli') || name.includes('cabbage');
            default:
              return true;
          }
        } else {
          // Handle database objects
          return plant.plant.category === activeFilter;
        }
      });
      setFilteredGarden(filtered);
    }
  }, [activeFilter, garden]);

  const handlePlantClick = async (plant) => {
    if (typeof plant === 'string') {
      // Handle localStorage fallback
      navigate(`/plant-detail/${encodeURIComponent(plant)}`);
    } else {
      // Handle database object - show journal modal
      setSelectedPlant(plant);
      setShowJournalModal(true);
      
      // Load journal entries
      try {
        const response = await fetch(`/api/garden/${plant._id}/journal`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setJournalEntries(data.journalEntries);
          }
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    }
  };

  const handleAddJournalEntry = async () => {
    if (!newEntry.trim() || !selectedPlant) return;

    try {
      const response = await fetch(`/api/garden/${selectedPlant._id}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newEntry,
          growthStage: 'growing'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJournalEntries(prev => [data.journalEntry, ...prev]);
          setNewEntry('');
        }
      }
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const closeJournalModal = () => {
    setShowJournalModal(false);
    setSelectedPlant(null);
    setJournalEntries([]);
    setNewEntry('');
  };

  const getPlantImage = (plant) => {
    if (typeof plant === 'string') {
      // Handle localStorage fallback
      const sampleImages = {
        'Sweet Basil': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&h=200&fit=crop',
        'Cherry Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
        'Fresh Mint': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop',
        'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
        'Bell Pepper': 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&h=200&fit=crop',
        'Strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop'
      };
      return sampleImages[plant] || 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
    } else {
      // Handle database object
      return plant.plant.image || 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
    }
  };

  const getPlantName = (plant) => {
    return typeof plant === 'string' ? plant : plant.plant.name;
  };

  const getPlantDescription = (plant) => {
    if (typeof plant === 'string') {
      const descriptions = {
        'Sweet Basil': 'Aromatic herb perfect for cooking. Great for beginners!',
        'Cherry Tomato': 'Small, sweet tomatoes that are easy to grow indoors.',
        'Fresh Mint': 'Fast-growing herb perfect for teas and cooking.',
        'Lettuce': 'Crisp, fresh greens perfect for salads.',
        'Bell Pepper': 'Colorful peppers that add flavor to any dish.',
        'Strawberry': 'Sweet, juicy berries perfect for desserts.'
      };
      return descriptions[plant] || 'A wonderful addition to your garden!';
    } else {
      return plant.plant.description;
    }
  };

  const getPlantCategory = (plant) => {
    return typeof plant === 'string' ? 'Herbs' : plant.plant.category;
  };

  const getAddedDate = (plant) => {
    if (typeof plant === 'string') {
      const dates = ['Jan 15, 2024', 'Jan 10, 2024', 'Jan 8, 2024', 'Jan 12, 2024', 'Jan 5, 2024', 'Jan 3, 2024'];
      return dates[Math.floor(Math.random() * dates.length)];
    } else {
      return new Date(plant.addedDate).toLocaleDateString();
    }
  };

  const getPlantStatus = (plantName) => {
    // For now, return a random status. In a real app, this would come from plant data
    const statuses = ['Growing', 'Planted', 'Harvested'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center">
                <FaLeaf className="text-green-600 text-2xl mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Garden Journal</h1>
                  <p className="text-gray-600">Track your plants, progress, and memories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Plant Grid */}
        {filteredGarden.length === 0 ? (
          <div className="text-center py-16">
            <FaLeaf className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants found</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'All' 
                ? "Start by adding plants to your garden from the Plant Suggestion assistant!"
                : `No ${activeFilter.toLowerCase()} found in your garden.`
              }
            </p>
            <button
              onClick={() => navigate('/plant-suggestion')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Find Plants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarden.map((plant) => (
              <div
                key={typeof plant === 'string' ? plant : plant._id}
                onClick={() => handlePlantClick(plant)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Plant Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={getPlantImage(plant)}
                    alt={getPlantName(plant)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200/90EE90/FFFFFF?text=Plant+Image';
                    }}
                  />
                  {/* Status Tag */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getPlantStatus(getPlantName(plant)) === 'Growing' 
                        ? 'bg-green-100 text-green-700'
                        : getPlantStatus(getPlantName(plant)) === 'Planted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getPlantStatus(getPlantName(plant))}
                    </span>
                  </div>
                </div>

                {/* Plant Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{getPlantName(plant)}</h3>
                  <p className="text-gray-600 text-sm mb-3">{getPlantDescription(plant)}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <FaCalendar className="mr-1" />
                    <span>Added {getAddedDate(plant)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/plant-suggestion')}
        className="fixed bottom-6 right-6 bg-green-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
      >
        <FaPlus className="text-xl" />
      </button>

      {/* Journal Modal */}
      {showJournalModal && selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <img 
                  src={getPlantImage(selectedPlant)} 
                  alt={getPlantName(selectedPlant)}
                  className="w-12 h-12 rounded-lg object-cover mr-4"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{getPlantName(selectedPlant)}</h2>
                  <p className="text-sm text-gray-600">{getPlantDescription(selectedPlant)}</p>
                </div>
              </div>
              <button 
                onClick={closeJournalModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Add New Entry */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Journal Entry</h3>
              <div className="flex space-x-3">
                <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="How is your plant doing today? Share your observations..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="3"
                />
                <button
                  onClick={handleAddJournalEntry}
                  disabled={!newEntry.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save
                </button>
              </div>
            </div>

            {/* Journal Entries */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Journal Entries</h3>
              {journalEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No journal entries yet. Start documenting your plant's journey!</p>
              ) : (
                <div className="space-y-4">
                  {journalEntries.map((entry, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {entry.growthStage}
                        </span>
                      </div>
                      <p className="text-gray-800">{entry.content}</p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">Note: {entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGardenJournal;
