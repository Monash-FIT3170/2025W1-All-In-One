import React from 'react';
export const CollapsedTicket = ( {ticket} ) => {
    
    
    return (
        <div className="bg-[#CBADD8] border p-4 rounded-lg shadow-md mb-4">
            <strong>Ticket No: </strong>{ticket.ticket_no}
            <p>Title: {ticket.title}</p>
            <p>Date logged Logged: {ticket.date_logged}</p>
        </div>
    );
}