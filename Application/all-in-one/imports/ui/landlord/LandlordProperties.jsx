import React, {useState, useMemo} from "react";
import { FaBath, FaBed, FaCar, FaCouch, FaSearch, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./components/LandlordNavbar";
import Footer from "./components/Footer";
import PropertyCard from "../globalComponents/BasicPropertyCard";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Properties, Photos } from "../../api/database/collections"; // importing mock for now


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This page will display all the listings connected to the Landlord (should be linked to property tab in nav bar) //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function LandlordProperties() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const defaultFilters = useMemo(
      () => ({
        furnished: false,
        pets: false,
        rooms: "",
        cars: "",
        baths: "",
        minPrice: "",
        maxPrice: "",
        propertyType: "",
        availableFrom: "",
      }),
      []
    );
    const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
    const handleClearFilters = () => setFilters({ ...defaultFilters });
    const handleOk = () => setShowFilters(false);


    const { isReady, properties, photos }=  useTracker(()=>{
      const subProps= Meteor.subscribe("properties");
      const subPhotos= Meteor.subscribe("photos");
  
      const isReady= subProps.ready() && subPhotos.ready();
      const landlord = Meteor.user();
      const LandLordId = landlord?._id;
      const properties= isReady ? Properties.find({landlord_id: LandLordId}).fetch(): [];
      const photos= isReady ? Photos.find().fetch(): [];
  
      return { isReady, properties, photos};
    });
  
    if (!isReady){
      return <div className="text-center text-gray-600 mt-10">Loading Properties...</div>;
    }
  
    const propertyCards= properties.map((p)=>{
      // Prefer Cloudinary URLs stored in Properties.photo (objects or strings)
      let firstPhotoUrl;
      if (Array.isArray(p.photo)) {
        const firstNonVideoPhoto = p.photo.find((item) => {
          if (typeof item === 'string') return item.trim().length > 0;
          if (item && typeof item === 'object') {
            const isNotVideo = item.isVideo === false || item.isVideo === undefined;
            const isNotPdf = item.isPDF === false || item.isPDF === undefined;
            return Boolean(item.url) && isNotVideo && isNotPdf;
          }
          return false;
        });
        if (typeof firstNonVideoPhoto === 'string') {
          firstPhotoUrl = firstNonVideoPhoto;
        } else if (firstNonVideoPhoto && typeof firstNonVideoPhoto === 'object') {
          firstPhotoUrl = firstNonVideoPhoto.url;
        }
      }
      return {
        id: p.prop_id,
        location: p.prop_address,
        price:`$${p.prop_pricepweek}`,
        image: firstPhotoUrl || `/images/default.jpg`,
        beds: p.prop_numbeds,
        baths: p.prop_numbaths,
        cars: p.prop_numcarspots,
        furnished: p.prop_furnish,
        pets: p.prop_pets,
        type: p.prop_type,
        availableDate: p.prop_available_date,
        starred: false // Landlords don't need starred functionality for their own listings
      };
    });

    const parseDate = (value) => {
      if (!value) return null;
      if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const filteredProperties = propertyCards.filter((p) => {
      if (filters.furnished && !p.furnished) return false;
      if (filters.pets && !p.pets) return false;
      if (filters.rooms && p.beds < parseInt(filters.rooms)) return false;
      if (filters.cars && p.cars < parseInt(filters.cars)) return false;
      if (filters.baths && p.baths < parseInt(filters.baths)) return false;

      const price = parseInt(p.price.replace("$", "").replace(",", "") || 0);
      if (filters.minPrice && price < parseInt(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseInt(filters.maxPrice)) return false;

      if (filters.propertyType && p.type && p.type !== filters.propertyType)
        return false;

      if (searchQuery && !p.location.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;

      if (filters.availableFrom) {
        const filterDate = parseDate(filters.availableFrom);
        if (filterDate) {
          const propertyDate = parseDate(p.availableDate);
          if (!propertyDate || propertyDate < filterDate) return false;
        }
      }

      return true;
    });


  return (
    <div className="min-h-screen bg-[#FFF8E9] flex flex-col">
      {/*Header*/}
      <Navbar />

      {/* Page Heading */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6">
        <div className="pl-6">
          <h1 className="text-3xl font-medium text-gray-800">Your Properties</h1>
          <p className="text-gray-600 text-base mt-1">All your properties in one place!</p>
          <hr className="my-6 border-t-2 border-gray-300 w-full" />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex justify-center">
        <div className="bg-[#CBADD8] p-4 rounded-lg flex gap-4 w-full" style={{ maxWidth: '1185px' }}>
          
          {/* Search field */}
          <div className="flex items-center bg-white px-3 py-2 rounded-md w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Postcode..."
              className="flex-1 outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search button with icon */}
          <button className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md">
            <FaSearch className="mr-2" />
            Search
          </button>

          {/* Filter button with icon */}
          <button
            className="flex items-center justify-center bg-[#9747FF] hover:bg-[#7d3dd1] text-white px-4 py-2 rounded-md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="mr-2" />
            Filter
          </button>
        </div>
      </div>

    {/* Filter section */}
        {showFilters && (
        <div className="mt-4 flex justify-center">
          <div
            className="bg-[#CBADD8] py-10 px-10 rounded-lg flex flex-col gap-6 w-full min-h-[400px] relative"
            style={{ maxWidth: "1100px" }}
          >
            {/* Furnished & Pets checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.furnished}
                  onChange={(e) =>
                    setFilters({ ...filters, furnished: e.target.checked })
                  }
                />
                Furnished
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.pets}
                  onChange={(e) =>
                    setFilters({ ...filters, pets: e.target.checked })
                  }
                />
                Pets Allowed
              </label>
            </div>

            {/* Number inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Rooms</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded border"
                  value={filters.rooms}
                  onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Car Spots</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded border"
                  value={filters.cars}
                  onChange={(e) => setFilters({ ...filters, cars: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Bathrooms</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded border"
                  value={filters.baths}
                  onChange={(e) => setFilters({ ...filters, baths: e.target.value })}
                />
              </div>
            </div>

            {/* Price range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">Min Price</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded border"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Max Price</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded border"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Property type dropdown */}
            <div>
              <label className="block mb-1 font-semibold">Property Type</label>
              <select
                className="w-full p-2 rounded border bg-white text-black"
                value={filters.propertyType}
                onChange={(e) =>
                  setFilters({ ...filters, propertyType: e.target.value })
                }
              >
                <option value="">Select type</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Unit">Unit</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Available From</label>
              <input
                type="date"
                className="w-full p-2 rounded border"
                value={filters.availableFrom}
                onChange={(e) =>
                  setFilters({ ...filters, availableFrom: e.target.value })
                }
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-3 justify-end">
              <button
                className="bg-[#9747FF] text-white px-6 py-2 rounded hover:bg-[#7d3dd1]"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
              <button
                className="bg-[#22c55e] text-white px-6 py-2 rounded hover:bg-[#16a34a]"
                onClick={handleOk}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

          {/* Add Listing Button */}
          <div className="mt-4 w-full flex justify-center">
            <div className="w-[1220px] px-4 py-3 flex justify-start rounded-lg">
              <Link
                to="/AddPropertyListing"
                className="px-6 py-2 text-white rounded-lg focus:outline-none"
                style={{
                  backgroundColor: "#9747FF",
                  color: "#bg-violet-900",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "bg-violet-900")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#9747FF")
                }
              >
                Add Property Listing
              </Link>
            </div>
          </div>

      {/* Property Grid */}
      <div className="mt-8 w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-20 w-full max-w-[1230px] px-6">
          {filteredProperties.length === 0 ? (
                      <p className="text-gray-700 text-center col-span-2">
                        No properties match your filters.
                      </p>
                    ) : (
                      filteredProperties.map((property) => (
                        <PropertyCard
                          key={property.id}
                          property={property}
                          showFav={false}
                          onStarToggle={(p) => console.log("Favourited:", p)}
                          linkTo={`/LandlordDetailedProp/${property.id}`}
                        />
                      ))
                    )}
                  </div>
                </div>
          
          
      
      {/* Blank space before footer */}
      <div className="h-40" />

      {/*Footer*/}
      <Footer />
    </div>
  );
}
