import moment from 'moment';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './style/App.css';

function App() {

  const searchInput = useRef();
  const loader = useRef();

  const [loading , setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [search, setSearch] = useState([]);
  const [endList, setEndList] = useState(false);
  const [launchCards, setLaunchCards] = useState([]);

  useEffect( () => {
    if ( loader.current ) {
      let io = new IntersectionObserver( (entries) => {
        if ( entries[0].isIntersecting ) {
          if ( endList == false && searchInput.current.value == '' ) {
            setLoading(true);
          }
        } else {
          setLoading(false);
        }
      }, {
        threshold : 1
      } )
      io.observe( loader.current );
    }

  }, [loader] );

  useEffect( () => {
    if ( loading == true ) {
      getAllLaunches(results);
    }
  }, [loading] );

  useLayoutEffect( () => {

    if ( results != undefined ) {
      let cards = [];
      results.forEach(element => {
        cards.push( <Launch key={element.mission_name + "-" + element.flight_number} data={element} /> )
      });
      setLaunchCards(cards);
      setResultsCount(results.length);
    }

  }, [results] );
  
  useLayoutEffect(() => {
    
    let cards = [];
    if ( search.length > 0 ) {
      search.forEach(element => {
        cards.push( <Launch key={element.mission_name + "-" + element.flight_number} data={element} /> )
      });
      setLaunchCards(cards);
    } 

  }, [search]);

  function getAllLaunches() {
    let xml = new XMLHttpRequest();
    xml.open( 'GET', "https://api.spacexdata.com/v3/launches?limit=" + (resultsCount + 10) + "&sort=flight_number&order=desc" );
    xml.onreadystatechange = () => {
      if ( xml.readyState === 4 && xml.status === 200 ) {
        if ( JSON.parse(xml.response).length == results.length ) {
          setEndList(true);
        } else {
          setResults(JSON.parse(xml.response));
        }
      }
    }
    xml.send();
  }

  function searchLaunch( event ) {
    if ( event.which == 13 ) {
      if ( event.target.value != '' ) {
        let x =[];
        results.forEach(element => {
          if ( element.mission_name.includes(event.target.value) ) {
            x.push(element);
          }
        });
        console.log(x);
        setSearch(x);
      }
    }
  }

  function resetSearch( event ) {
    if ( event.target.value == '' ) {
      setResults([...results]);
    }
  }

  return (
    <div className="App"> 
      <input type="search" ref={searchInput} onKeyDown={searchLaunch} onChange={resetSearch} placeholder='Search'/>
      <div className="launches-container">
        {launchCards}
        <span className={"loader " + ( endList ? 'end-of-list' : '' )} ref={loader}>
          <span className={"loader-spin " + (loading == true && endList == false ? "show" : "")}></span>
        </span>
      </div>
    </div>
  );
}

function Launch( props ) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="launch">
      <div className="mission-header">
        <span className="mission-name">{props.data.mission_name}</span>
        <span className={"mission-status " + (props.data.upcoming == true ? "mission-status--upcoming" : props.data.launch_success == true ? "mission-status--success" : "mission-status--failed")}>{props.data.upcoming == true ? "UPCOMING" : props.data.launch_success == true ? "SUCCESS" : "FAILED"}</span>
      </div>
      <div className={"mission-details " + (showDetails ? "show" : "")}>
        <div className="details-top">
          <span className="mission-date">{moment.unix(props.data.launch_date_unix).fromNow()}</span>
          { props.data.links.article_link != null && <a href={props.data.links.article_link} target={'_black'}>Article</a> }
          { props.data.links.video_link != null && <a href={props.data.links.video_link} target={'_black'}>Video</a> }
        </div>
        <div className="details-bottom">
          { showDetails ? props.data.links.mission_patch_small == null ?
            <span className="no-image">No image yet</span> : 
            <img src={props.data.links.mission_patch_small} alt={props.data.mission_name + " mission patch"} /> : ''
          }
          { showDetails ? props.data.details == null ?
            <span className="no-details">No details yet</span> : 
            <p className='details'>{props.data.details}</p> : ''
          }
        </div>
      </div>
      <button className='mission-details-button' onClick={() => setShowDetails(!showDetails)} >{showDetails ? "Hide" : "Details"}</button>
    </div>
  );
}

export default App;
