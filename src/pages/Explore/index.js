import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { MdLocationPin } from "react-icons/md";
import { ProgressBar } from "react-loader-spinner";
import ReusableInput from "../../utils/ReusableInput";
import ReusableButton from "../../utils/ReusableButton";
import EachRestaurantCard from "../../components/EachRestaurantCard";
import Shimmer from "../../components/Shimmer";
import Footer from "../../components/Footer";

const constApiStatus = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Explore = () => {
  const [cityName, setCityName] = useState("");
  const [isSearchEmpty, setSearchEmpty] = useState(false);
  const [geoLactions, setGeoLocations] = useState({
    lat: "",
    lon: "",
  });
  const [apiStaus, setApiStatus] = useState({
    status: constApiStatus.intial,
    errorMsg: "",
    cityName: "",
    data: [],
  });

  const onClickSearch = async () => {
    if (cityName === "") {
      setSearchEmpty(true);
    } else {
      setSearchEmpty(false);
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.inProgress,
      }));
      try {
        const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=a3547addf902f2a1e709f062a2e801dd`;
        const data = await fetch(apiUrl);
        const response = await data.json();
        setGeoLocations({
          lat: response[0].lat,
          lon: response[0].lon,
        });
      } catch (error) {
        setApiStatus((prev) => ({
          ...prev,
          status: constApiStatus.failure,
          errorMsg: "Please Enter The Correct City Name",
        }));
      }
    }
  };

  const getData = async () => {
    const { lat, lon } = geoLactions;
    if (lat === "" && lon === "") {
      setApiStatus((prev) => ({
        ...prev,
        status: constApiStatus.initial,
      }));
    } else {
      try {
        setApiStatus((prev) => ({
          ...prev,
          status: constApiStatus.inProgress,
        }));
        const apiUrl = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.385044&lng=78.486671&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;
        const response = await fetch(apiUrl);
        if (response.ok === true) {
          const data = await response.json();
          setApiStatus((prev) => ({
            ...prev,
            data: data?.data?.cards[2]?.card?.card?.gridElements?.infoWithStyle
              ?.restaurants,
            cityName: cityName,
            status: constApiStatus.success,
          }));
        } else {
          setApiStatus((prev) => ({
            ...prev,
            status: constApiStatus.failure,
            errorMsg: "Please Check Your City Name Once",
          }));
        }
      } catch (error) {
        setApiStatus((prev) => ({
          ...prev,
          status: constApiStatus.failure,
          errorMsg:
            "Something Got an Error Please Refresh The Page And Try Again",
        }));
      }
    }
  };

  useEffect(() => {
    getData();
  }, [geoLactions]);

  const SuccessView = () => (
    <>
      {apiStaus?.data?.length > 0 ? (
        <ul className="p-0 flex flex-col sm:flex-row sm:flex-wrap space-y-3">
          <li></li>
          {apiStaus?.data?.map((each) => (
            <EachRestaurantCard
              key={each.info.id}
              restaurantList={each?.info}
            />
          ))}
        </ul>
      ) : null}
    </>
  );

  const FailureView = () => (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h1>Failure View</h1>
      <p>{apiStaus.errorMsg}</p>
    </div>
  );

  const RenderResults = () => {
    switch (apiStaus.status) {
      case constApiStatus.inProgress:
        return <Shimmer />;
      case constApiStatus.success:
        return <SuccessView />;
      case constApiStatus.failure:
        return <FailureView />;
      default:
        return null;
    }
  };

  return (
    <div className="p-2 h-[90%] md:px-10 relative">
      <div
        className={`search-city flex items-center border border-black w-fit rounded-md ${
          isSearchEmpty ? "border-red-600 border-2" : null
        }`}
      >
        <ReusableInput
          type="search"
          className="p-1 pb-2 w-full max-w-[250px]"
          placeholder="Enter A City Name"
          onChange={(e) => {
            const newCityName = e.target.value;
            setCityName(newCityName);
          }}
          onKeyDown={(e) => (e.key === "Enter" ? onClickSearch() : null)}
          value={cityName}
        />
        <ReusableButton
          value={<FaSearch />}
          className={`h-10 border flex flex-col items-center justify-center border-black border-r-0 border-b-0 border-t-0 hover:bg-blue-300 ${
            isSearchEmpty ? "border-red-600 border-2" : null
          }`}
          onClick={onClickSearch}
        />
      </div>
      <div className="main-body h-full w-full flex flex-col">
        <div className="mb-4">
          {apiStaus?.status === constApiStatus?.success ? (
            <p className="text-center flex items-center justify-center my-2 font-bold capitalize">
              <MdLocationPin />
              {apiStaus.cityName}
            </p>
          ) : apiStaus?.status === constApiStatus?.inProgress ? (
            <p className="text-center flex items-center justify-center">
              <ProgressBar
                height="40"
                width="40"
                borderColor="#F4442E"
                barColor="#51E5FF"
              />
            </p>
          ) : null}
          {RenderResults()}
        </div>
        <div className="border flex flex-col items-center mt-auto w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
};
export default Explore;
