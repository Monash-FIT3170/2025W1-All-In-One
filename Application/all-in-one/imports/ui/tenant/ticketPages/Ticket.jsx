import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse'; // For smooth collapse animation
import { ResolveTicketDialog } from './ResolveTicketDialog'; 


export const Ticket = ( { ticket, setShowResolveTicketDialog } ) => {
    
    const [isExpanded, setIsExpanded] = useState(false);
    const isMaintenanceTicket = ticket.type === 'Maintenance';

    const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    };


    const closeDialog = () => {
        setShowResolveTicketDialog(false);
    }

    return (
        <div className="bg-[#CBADD8] border rounded-3xl shadow-md flex flex-col relative  px-4 pt-4 pb-8" title={isExpanded ? "Collapse Ticket" : "Expand Ticket"}>
            <IconButton onClick={handleToggleExpand} aria-label="toggle expand" className="!absolute !top-3 !right-3 text-2xl font-bold text-black hover:text-gray-700">
                {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
                
            </IconButton>
            <div className="mt-8 px-10">
                <p><strong className="font-bold font-sans">Ticket Number: </strong>{ticket.ticket_no}</p>
                <p><strong className="font-bold font-sans">Title: </strong>{ticket.title}</p>
                <p><strong className="font-bold font-sans">Type: </strong>{ticket.type}</p>
                <p><strong className="font-bold font-sans">Date Logged: </strong>{ticket.date_logged}</p>
                <p><strong className="font-bold font-sans">Status: </strong>{ticket.status}</p>
            </div>
            
            <Collapse in={isExpanded}>
                <div className="px-10 max-h-[300px] overflow-y-auto">
                    {/* expandable content */}
                    {isMaintenanceTicket ? ( // for maintenance tickets
                        <div>
                            <p><strong className="font-bold font-sans">Issue Start Date: </strong>{ticket.issue_start_date.toLocaleDateString()}</p>
                            <p><strong className="font-bold font-sans">Issue Description: </strong></p>
                            <p>{ticket.description}</p>
                        </div>
                    ) : ( // for general tickets
                        <div>
                            <p><strong className="font-bold font-sans">Description: </strong></p>
                            <p>{ticket.description}</p>
                        </div>
                    )}
                </div>
            </Collapse>
            {/* Resolve Ticket Button */}
            {ticket.status === 'Active' && (
                <button
                    type="button"
                    onClick={() => setShowResolveTicketDialog(ticket.ticket_id)}
                    className="mt-8 mb-2 self-center w-1/3 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-3xl shadow-md transition duration-200"
                    >
                    Resolved
                </button>
            )}
        </div>
    );
};