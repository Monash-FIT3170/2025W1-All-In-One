import React, { useState , useEffect} from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ConfirmDialog } from './ConfirmDialog'; 
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { InspectionAvailabilities } from '../api/InspectionAvailabilities';
import { ClearDialog } from './ClearDialog'; 
import { TypeDialog } from './TypeDialog';  
import { OpenHouseDialog } from './OpenHouseDialog.jsx'; 
// import { InspectionDialog } from './InspectionDialog'; 
import { EventDetailModal } from './EventDetailModal'; 




export const Calendar = () => {
  const [newEvents, setNewEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [showOpenHouseDialog, setShowOpenHouseDialog] = useState(false);
  // const [showInspectionDialog, setShowInspectionDialog] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); 

  const { availabilities, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe('inspectionAvailabilities');
    const data = InspectionAvailabilities.find().fetch();
    return {
      availabilities: data,
      isLoading: !handler.ready(),
    };
  });
  
  const handleSelect = (info) => {
    setPendingSlot({ start: info.startStr, end: info.endStr });
    setShowTypeDialog(true);
  };

  const handleTypeSelect = (type) => {
    setShowTypeDialog(false);
    if (type === 'Open House') {
      setShowOpenHouseDialog(true);
    } else if (type === 'Inspection') {
      handleBookingSelect({
        type,
        property: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        parking: '',
        image: '',
      });
    }
  };

  // const handleBookingSelect = ({ type, property, price, bedrooms, bathrooms, parking, tenant, tenantAge, occupation, notes, image }) => {
  const handleBookingSelect = ({ type, property, price, bedrooms, bathrooms, parking, image }) => {
    const tempEvent = {
      id: Date.now(),
      start: pendingSlot.start,
      end: pendingSlot.end,
      type,
      status: 'pending',
      title: `Pending: ${type} Availability`,
      property,
      price,
      bedrooms,
      bathrooms,
      parking,
      // tenant,
      // tenantAge,
      // occupation,
      // notes,
      image,
      allDay: false,
    };
    setNewEvents((prev) => [...prev, tempEvent]);
    setPendingSlot(null);
    setShowOpenHouseDialog(false); 
    // setShowInspectionDialog(false);
  };
  

  const handleConfirmButtonClick = () => {
    setShowDialog(true); 
  };

  const handleClearButtonClick = () => {
    setShowClearDialog(true);   
  };

  const handleConfirm = () => {
    newEvents.forEach(event => {
      Meteor.call(
        'inspectionAvailabilities.insert',
        event.start,
        event.end,
        event.type,
        event.property,
        event.price,
        event.bedrooms,
        event.bathrooms,
        event.parking,
        // event.tenant,
        // event.notes,
        event.image,
        // event.tenantAge,
        // event.occupation,
        'confirmed',
        (error) => {
          if (error) {
            alert('Insert failed: ' + error.reason);
            console.error('Failed to create availability:', error.reason);
          }
        }
      );      
    });
    setNewEvents([]);
    setShowDialog(false);
  };
  
  const handleClearConfirm = () => {
    Meteor.call('inspectionAvailabilities.clear', (error) => {
      if (error) {
        console.error('Failed to clear availabilities: ' + error.reason);
      } else {
        // window.location.reload(); reload for clear button
      }
    });
    setNewEvents([]);
    setShowClearDialog(false);
  };

  const handleCancel = () => {
    setNewEvents([]);
    setShowDialog(false);
  };
  
  const handleClearCancel = () => {
    setShowClearDialog(false);
  };

  
  
  return (
    <div className="bg-[#FFF8E9] min-h-screen p-8">

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Add Availability</h2>
        <p className="text-gray-500 mt-2">Click empty timeslot to create Availability.</p>
        <p className="text-gray-500 mt-2">These will appear as timeslots for possible tenants to book inspections or open house for any property.</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 max-w-6xl mx-auto mb-6"></div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          scrollTime="07:00:00"
          allDaySlot={false}
          selectable={true}          
          select={handleSelect}      
          events={[
            ...availabilities.map(slot => ({
              ...slot,
              id: slot._id,
              title: slot.type ? `${slot.type} Availability` : 'Available',
              start: slot.start,
              end: slot.end,
              allDay: false,
              backgroundColor:
                slot.status === 'pending'
                  ? '#F2F2F2'  
                  : slot.type === 'Open House'
                  ? '#FFF8E9' 
                  : '#CEF4F1',
              // backgroundColor: slot.type === 'Open House' ? '#FFF8E9' : '#CEF4F1',
              textColor:
                slot.status === 'pending'
                  ? '#000000'  
                  : slot.type === 'Open House'
                  ? '#A98A22' 
                  : '#24A89E',
              // textColor: slot.type === 'Open House' ? '#A98A22' : '#24A89E',
              borderColor:
                slot.status === 'pending'
                  ? '#000000'  
                  : slot.type === 'Open House'
                  ? '#A98A22' 
                  : '#24A89E',
              // borderColor: slot.type === 'Open House' ? '#A98A22' : '#24A89E',
              ...slot
            })),
            ...newEvents.map(event => ({
              ...event,
              backgroundColor: '#F2F2F2', 
              textColor: '#000000',
              borderColor: '#000000',
            })),
          ]}             
          eventClick={(info) => {
            const clicked = info.event.extendedProps;
            if (clicked.type === 'Open House') {
              setSelectedEvent({
                title: info.event.title,
                start: info.event.start,
                end: info.event.end,
                ...clicked,
              });
            } 
          }}          
          // eventTextColor='#24A89E'             
          // eventBackgroundColor="#CEF4F1"
          // eventBorderColor="#24A89E"
          headerToolbar={{
            left: 'prev today next',
            center: '',
            right: 'title'
          }}
          buttonText={{
            today: 'Today'
          }}
          titleFormat={{ 
            year: 'numeric', month: 'long' 
          }}
          height="auto"
        />
        {/* Dialog Component */}
        <ConfirmDialog isOpen={showDialog} onConfirm={handleConfirm} onCancel={handleCancel} />
        <ClearDialog isOpen={showClearDialog} onConfirm={handleClearConfirm} onCancel={handleClearCancel} />
        <TypeDialog isOpen={showTypeDialog} onSelect={handleTypeSelect} onClose={() => setShowTypeDialog(false)} /> 
        <OpenHouseDialog isOpen={showOpenHouseDialog} onSubmit={handleBookingSelect} onClose={() => setShowOpenHouseDialog(false)} />
        {/* <InspectionDialog isOpen={showInspectionDialog} onSubmit={handleBookingSelect} onClose={() => setShowInspectionDialog(false)} /> */}
      </div>

      {/* Detail view modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Buttons */}
      <div className="flex justify-between max-w-6xl mx-auto mt-6">

        {/* Confirm */}
        <button onClick={handleConfirmButtonClick} disabled={newEvents.length === 0}className={`font-bold py-3 px-6 rounded-md ${newEvents.length === 0? 'bg-gray-300 cursor-not-allowed': 'bg-[#FFE284] hover:bg-yellow-200 text-black'}`}>
            Confirm 
        </button>


        <button onClick={handleClearButtonClick} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-md">
            Clear
        </button>

      </div>


    </div>
  );
};