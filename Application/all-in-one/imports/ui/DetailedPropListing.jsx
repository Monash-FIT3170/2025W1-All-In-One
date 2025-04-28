import React from "react";

export default function DetailedPropListing(){

    // mock data- should be connected to database once its set up
    const property={
        price: 800,
        address: "Melton South, 3338",
        imageUrls:[
            "/images/melton_property_kitchen.jpg",
            "/images/melton_property_livingroom.png",
            "/images/melton_property_outside.jpg",
            "/images/melton_property_pantry.jpg",
        ],
        details:{
            baths: 5,
            beds: 8,
            carSpots: 4,
            furnished: "Yes",
        },
        description:"Discover this expansive and elegant residence featuring 8 spacious rooms, 5 modern bathrooms, and ample parking for up to 4 vehicles. Designed with both functionality and luxury in mind, the home offers multiple living and entertainment zones, ideal for growing families or those who love to host. Each bathroom is thoughtfully appointed with contemporary fixtures and sleek finishes, while the generous floor plan provides flexibility for home offices, guest suites, or hobby spaces. Set on a sizable block in a desirable location, this property is the perfect blend of space, style, and convenience." 
    };

    return (
        <div className= "min-h-screen bg-[#FFF8EB] flex flex-col">

            {/*Header*/}
            <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]">
                <div className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Logo" className="h-12" />
                    <span className="text-xl font-bold">All In One</span>
                </div>
                <div className="flex gap-4">
                    {['Messages', 'Applications', 'Tickets', 'Properties'].map(label => (
                        <button key={label} className="bg-yellow-300 px-4 py-2 rounded-full font-semibold">
                            {label}
                        </button>
                    ))}
                    <button className="bg-yellow-300 px-4 py-2 rounded-full font-semibold">Log out</button>
                    <img src="/images/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
                </div>
            </div>


            {/*Footer*/}
            <footer className= "bg-[#CEF4F1] text-white py-6 mt-auto">
                
            </footer>

        </div>
    )
}