import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse'; // For smooth collapse animation
import { ResolveTicketDialog } from './ResolveTicketDialog'; 


export const CollapsedTicket = ( { ticket, setShowResolveTicketDialog } ) => {
    
    const [isExpanded, setIsExpanded] = useState(false);
    const isMaintenanceTicket = ticket.type === 'Maintenance';

    const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    };


    const closeDialog = () => {
        setShowResolveTicketDialog(false);
    }

    return (
        <div className="bg-[#CBADD8] border p-4 rounded-lg shadow-md flex flex-col items-center mx-4 relative">
            {/* Resolve Ticket Button */}
            <button
                type="button"
                onClick={() => setShowResolveTicketDialog(true)}
                className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700">
                ×
            </button>
            <div>
                <p><strong>Ticket Number: </strong>{ticket.ticket_no}</p>
                <p><strong>Title: </strong>{ticket.title}</p>
                <p><strong>Type: </strong>{ticket.type}</p>
                <p><strong>Date Logged: </strong>{ticket.date_logged}</p>
            </div>
            <IconButton onClick={handleToggleExpand} aria-label="toggle expand">
                {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
            </IconButton>
            <Collapse in={isExpanded}>
                <div>
                    {/* expandable content */}
                    {isMaintenanceTicket ? ( // for maintenance tickets
                        <div>
                            <p><strong>Issue Start Date: </strong>{ticket.issue_start_date.toLocaleDateString()}</p>
                            <p><strong>Issue Description: </strong>{ticket.description}</p>
                        </div>
                    ) : ( // for general tickets
                        <div>
                            <p><strong>Description: </strong></p>
                            <p>{ticket.description}</p>
                        </div>
                    )}
                </div>
            </Collapse>
            
        </div>
    );
};