import React from "react";
import { FaBath, FaBed, FaCar, FaStar, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

////////////////////////////////////////////////////////////////////////////
// Component used to display the Property as a card in the property lists //
////////////////////////////////////////////////////////////////////////////

export default function PropertyCard({
  property,
  showFav = false,
  linkTo,
}) {

  const [isStarred, setIsStarred] = React.useState(property.starred);

  function toggleFavourite(e){
    e.preventDefault();
    e.stopPropagation();

    const newStarredState = !isStarred;
    setIsStarred(newStarredState);

    if (newStarredState) {
      Meteor.call("starredProperties.add", property.id, (err) => {
        if (err) {
          console.error('Add star error:', err);
          alert(err.reason || err.message);
          setIsStarred(!newStarredState);
        }
      });
    } else {
      Meteor.call("starredProperties.remove", property.id, (err) => {
        if (err) {
          console.error('remove star error:', err);
          alert(err.reason || err.message);
          setIsStarred(!newStarredState);
        }
      });
    }
  }

  React.useEffect(() => {
    setIsStarred(property.starred);
  }, [property.starred]);


  const starButton= showFav?(

  <button
      onClick={toggleFavourite}
      aria-label="Add to favourites"
      className="absolute top-4 right-0 z-10 flex items-center bg-white/75 rounded-l-md px-2 py-1 shadow-md hover:bg-white"
      style={{ minWidth: '40px'}}
    >
              {isStarred ? <FaStar size={24} className="text-yellow-500"/> : <FaRegStar size={24} />}
            </button>
          ) : null;
  const cardContent = (
    <>
      {/* Background Image */}
      <img
        src={property.image}
        alt={property.location}
        className="w-full h-[375px] object-cover"
      />

      {/*Star button top*/}
      {starButton}

      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/85 p-4">
        <div className="mt-2 flex justify-between items-center">
          <h2 className="text-3xl font-medium text-gray-500">
            {property.price}{" "}
            <span className="text-3xl font-medium text-gray-500">per week</span>
          </h2>

          
          <p className="text-gray-600 text-right">{property.location}</p>
        </div>

        <div className="px-4 pb-4 mt-4 flex justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <FaBath size={24} />
            <span className="text-xl">{property.beds}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaBed size={24} />
            <span className="text-xl">{property.baths}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCar size={24} />
            <span className="text-xl">{property.cars}</span>
          </div>
        </div>
      </div>
    </>
  );
  return(
    <div className="relative bg-[#FFF8E9] rounded-lg shadow-md overflow-hidden">
      {linkTo? <Link to={linkTo}>{cardContent}</Link>: cardContent}
    </div>
  );
}