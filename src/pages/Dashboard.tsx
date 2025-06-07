import React, { useEffect } from 'react';
import { useLeads } from '../hooks/useLeads';

export const Dashboard = () => {
  const { leads, isLoading } = useLeads();

  // Get today's date in YYYY-MM-DD format, ensuring we use local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${year}-${month}-${day}`;

  // Debug logging
  useEffect(() => {
    console.log('=== Dashboard Component ===');
    console.log('Loading state:', isLoading);
    console.log('Today\'s date:', todayFormatted);
    console.log('Number of leads:', leads.length);
    console.log('All leads:', leads);
  }, [leads, isLoading, todayFormatted]);

  // Filter leads with follow-ups due today
  const todayFollowUps = leads.filter(lead => {
    if (!lead.next_follow_up) {
      console.log(`Lead ${lead.company_name} has no follow-up date`);
      return false;
    }
    const followUpDate = new Date(lead.next_follow_up);
    const followUpYear = followUpDate.getFullYear();
    const followUpMonth = String(followUpDate.getMonth() + 1).padStart(2, '0');
    const followUpDay = String(followUpDate.getDate()).padStart(2, '0');
    const followUpFormatted = `${followUpYear}-${followUpMonth}-${followUpDay}`;
    
    console.log('Follow-up comparison:', {
      lead: lead.company_name,
      followUpDate: lead.next_follow_up,
      followUpFormatted,
      todayFormatted,
      matches: followUpFormatted === todayFormatted
    });
    
    return followUpFormatted === todayFormatted;
  });

  // Get all leads with meetings, sorted by date and time
  const allMeetings = leads
    .filter(lead => lead.meeting_date && lead.meeting_time)
    .sort((a, b) => {
      // First sort by date
      const dateCompare = (a.meeting_date || '').localeCompare(b.meeting_date || '');
      if (dateCompare !== 0) return dateCompare;
      // Then sort by time
      return (a.meeting_time || '00:00:00').localeCompare(b.meeting_time || '00:00:00');
    });

  // Filter today's meetings
  const todayMeetings = allMeetings.filter(lead => lead.meeting_date === todayFormatted);

  console.log('Filtered results:', {
    todayFollowUps: todayFollowUps.length,
    todayMeetings: todayMeetings.length,
    allMeetings: allMeetings.length
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your lead management dashboard</p>
      </div>

      {/* Notifications Section */}
      <div className="mb-8 space-y-4">
        {/* Follow-up Notification */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {todayFollowUps.length > 0 
                  ? `You have ${todayFollowUps.length} follow-up${todayFollowUps.length > 1 ? 's' : ''} due today`
                  : 'No follow-ups due today'}
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Notification - Always shown */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {todayMeetings.length > 0 
                  ? `You have ${todayMeetings.length} meeting${todayMeetings.length > 1 ? 's' : ''} scheduled today`
                  : 'No meetings scheduled for today'}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium text-green-700 mb-1">Upcoming Meetings:</p>
                {allMeetings.length > 0 ? (
                  allMeetings.map(meeting => (
                    <div key={meeting.id} className="text-sm text-green-600">
                      • {meeting.company_name} on {meeting.meeting_date} at {meeting.meeting_time}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-green-600">No upcoming meetings scheduled</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the dashboard content */}
    </div>
  );
}; 