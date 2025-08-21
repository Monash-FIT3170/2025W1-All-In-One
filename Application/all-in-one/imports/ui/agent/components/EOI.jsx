import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse'; // For smooth collapse animation


export const EOI = ( { prospectiveTenName, address, EOI, isSelected, onSelect } ) => {
    
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    };

    function handleSelect() {
        onSelect();
        setIsExpanded(false);
    }

    return (
        <div className={`${isSelected ? 'bg-[#CBADD8]' : 'bg-[#ffffff]'} border rounded-3xl shadow-md flex flex-col relative pb-4`} title={isExpanded ? "Collapse Ticket" : "Expand Ticket"}>
            <div className="flex justify-between items-center">
                <div className="pt-2 px-4 text-left">
                    <p><strong className="font-bold font-sans">Prospective Tenant Name: </strong>{prospectiveTenName}</p>
                    <p><strong className="font-bold font-sans">Property: </strong>{address}</p>
                </div>
                <IconButton onClick={handleToggleExpand} aria-label="toggle expand" className=" text-2xl font-bold text-black hover:text-gray-700">
                    {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
                </IconButton>
            </div>
            <Collapse in={isExpanded}>
                <div className="px-4 max-h-[300px] overflow-y-auto text-left">
                    {/* expandable content */}
                    <p><strong className="font-bold font-sans">Expression of Interest: </strong></p>
                    <p>{EOI.EOI}</p>      
                </div>
                {/* Buttons */}
                <div className="px-4 flex justify-center gap-4">
                    <button
                        type="button"
                        className="mt-4 self-center w-1/3 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-3xl shadow-md transition duration-200"
                        >
                        Remove
                    </button>
                    <button
                        type="button"
                        onClick={handleSelect}
                        className="mt-4 self-center w-1/3 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-3xl shadow-md transition duration-200"
                        >
                        Select
                    </button>
                </div>
            </Collapse>
        </div>
    );
};