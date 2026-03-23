import "./searchItem.css";
import { Link } from "react-router-dom";

const SearchItem = ({
  id,
  src,
  name,
  dist,
  service,
  highlights,
  desc,
  category,
  ratings,
  price,
}) => {
  return (
    <div className="searchItem">
      <Link to={{ pathname: `/hotels/${id}`, state: { stateParam: true } }}>
        <img src={src} alt="" className="siImg" />
      </Link>

      <div className="siDesc">
        <h1 className="siTitle">{name}</h1>
        <span className="siDistance">{dist}</span>
        <span className="siTaxiOp">{service}</span>
        <span className="siSubtitle">{highlights}</span>
        <span className="siFeatures">{desc}</span>
        {/* <span className="siCancelOp">Free cancellation </span>
        <span className="siCancelOpSubtitle">
          You can cancel later, so lock in this great price today!
        </span> */}
      </div>
      <div className="siDetails">
        <div className="siRating">
          <span style={{ fontWeight: "Bold" }}>{category}</span>
          <button>{ratings}</button>
        </div>
        <div className="siDetailTexts">
          <span className="siPrice">{price} tk</span>
          <span className="siTaxOp">Includes taxes and fees</span>
          <button className="siCheckButton">See availability</button>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
