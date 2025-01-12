// For demo purposes, we'll use a simple command parser instead of OpenAI
export async function processAICommand(command: string) {
  try {
    if (!command.trim()) {
      throw new Error('Please enter a command');
    }

    const lowerCommand = command.toLowerCase();
    
    // Extract locations using simpler patterns
    let pickup = '';
    let dropoff = '';
    
    // First try to match the standard format
    const standardMatch = lowerCommand.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+at|$)/i);
    
    if (standardMatch) {
      pickup = standardMatch[1].trim();
      dropoff = standardMatch[2].trim();
    } else {
      // Try to find just locations without 'from' and 'to'
      const words = lowerCommand.split(/\s+/);
      const toIndex = words.indexOf('to');
      
      if (toIndex > 0) {
        // Everything before 'to' (excluding command words) is pickup
        pickup = words.slice(1, toIndex).join(' ').replace(/from\s*/i, '').trim();
        // Everything after 'to' (until 'at' if it exists) is dropoff
        const atIndex = words.indexOf('at');
        dropoff = words.slice(toIndex + 1, atIndex > -1 ? atIndex : undefined).join(' ').trim();
      }
    }

    if (!pickup || !dropoff) {
      throw new Error('Please specify both pickup and dropoff locations. Example: "book a cab from noida to mumbai at 7pm"');
    }

    // Parse time
    const timeMatch = lowerCommand.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    let scheduledTime = new Date();

    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      // Convert to 24-hour format
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      
      // If no meridiem specified and hours < 12, assume PM
      if (!meridiem && hours < 12) hours += 12;

      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time is in the past, schedule for tomorrow
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
    }

    console.log('Parsed command:', { pickup, dropoff, time: scheduledTime });

    return {
      pickup,
      dropoff,
      time: scheduledTime,
      shouldBook: true
    };
  } catch (error: any) {
    console.error('Error processing command:', error);
    throw error;
  }
}