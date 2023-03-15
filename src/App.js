import logo from './logo.svg';
import './App.css';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { Client } from 'ib-tws-api';

import TradingViewChart from './components/tradingviewchart';
function App() {

  // variable declartion
  const [stockProperty, setStockProperty] = useState({
    symbol:"RELIANCE.BSE",
    interval:"1D",
  })

  const [loading, setLoading] = useState(true)

  // const [stockVolumeData, setStockVolumeData] = useState([]);
  // const [stockPriceData, setStockPriceData] = useState([]);
  // const [stockAreaData, setStockAreaData] = useState([]);

  const [marketData, setMarketData] = useState(
    {
      price:[],
      volume:[],
      area:[],
    }
  )

  useEffect(() => {
      getStockPriceData();
  },[])

  useEffect(() => {
    getStockPriceData();
  },[stockProperty])
  
  

  const onStockPropertyCondition = (e) =>{
    const {name,value} = e.target
    setStockProperty({
      ...stockProperty,[name]:value
    })
  }

  const getStockPriceData = () =>{
    setLoading(true)

    let vol = [];
    let arr = [];
    let mov = [];
    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockProperty.symbol}&outputsize=full&apikey=A3QPG0GAAYX8VGI2`;
    axios.get(API_Call).then((result)=>{
      console.log("result", result.data)
      let time = result.data["Time Series (Daily)"];
      let co = 1;
      let avr = 0;
      for (let key in time) {
        if (!time.hasOwnProperty(key)) continue;
        let aa = {
          time: key,
          open: parseInt(time[key]["1. open"], 10),
          high: parseInt(time[key]["2. high"], 10),
          low: parseInt(time[key]["3. low"], 10),
          close: parseInt(time[key]["4. close"], 10)
        };
        let closePrice = parseInt(time[key]["4. close"], 10);
        avr = (avr * (co - 1) + closePrice) / co;
        let cc = {
          time: key,
          value: avr
        };
        let bb = {
          time: key,
          value: parseInt(time[key]["6. volume"], 10)/3000
        };
        co++;
        vol.push(bb);
        arr.push(aa);
        mov.push(cc);
      }
      setMarketData({
        price:arr.reverse(),
        volume:vol.reverse(),
        area:mov.reverse()
      })
      setLoading(false)
    });
  }
  
  return (
    <div className="container-fluid">
      <div className='row'>
        <div className='col-md-8 tradingview-panel'>
            <h4 className='text-center'>Tradingview</h4>
            <div className='d-flex justify-content-between'>
              <div>
                <input className='form-control' placeholder='AAPL' name='symbol' onChange={onStockPropertyCondition}/>
              </div>
              <div>
                <select className='form-control' name='interval' onChange={onStockPropertyCondition}>
                  <option value={"1D"}>1D</option>
                  <option value={"1W"}>1W</option>
                  <option value={"1M"}>1M</option>
                </select>
              </div>
              <div>
                <button className='btn btn-primary' onClick={getStockPriceData}>Search</button>
              </div>
            </div>
            <div className="w-100 mt-3">
              {!loading && <TradingViewChart propsMarketData = {marketData}/>}
            </div>
        </div>
        <div className='col-md-4 setting-panel'>
            <h4 className='text-center'>Setting</h4>
            <form>
              <div className='form-group'></div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default App;
