const mongoose = require('mongoose');
const UserGarden = require('./server/models/UserGarden');
require('dotenv').config();

async function testStatusUpdate() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find an active garden entry
    const gardenEntry = await UserGarden.findOne({ isActive: true });
    if (!gardenEntry) {
      console.log('❌ No active garden entry found');
      return;
    }

    console.log('📋 Found garden entry:', gardenEntry._id);
    console.log('📋 Current status:', gardenEntry.status);
    console.log('📋 Plant name:', gardenEntry.plant.name);

    // Test updating to multiple_harvests
    console.log('🔄 Updating status to multiple_harvests...');
    gardenEntry.status = 'multiple_harvests';
    
    try {
      await gardenEntry.save();
      console.log('✅ Status updated successfully to:', gardenEntry.status);
    } catch (saveError) {
      console.error('❌ Error saving:', saveError.message);
      console.error('❌ Full error:', saveError);
    }

    // Test other status values
    const testStatuses = ['first_harvest', 'completed', 'failed'];
    for (const status of testStatuses) {
      console.log(`🔄 Testing status: ${status}`);
      gardenEntry.status = status;
      try {
        await gardenEntry.save();
        console.log(`✅ Status ${status} works`);
      } catch (error) {
        console.error(`❌ Status ${status} failed:`, error.message);
      }
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testStatusUpdate();




