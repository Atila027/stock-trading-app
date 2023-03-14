import logo from './logo.svg';
import './App.css';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { Client } from 'ib-tws-api';


import TradingViewChart from './components/tradingviewchart';
function App() {


  useEffect(() => {

    return () => {
      
    }
  }, [])

    const initialData =  [
      { time: '2018-10-19', open: 180.34, high: 180.99, low: 178.57, close: 179.85 },
      { time: '2018-10-22', open: 180.82, high: 181.40, low: 177.56, close: 178.75 },
      { time: '2018-10-23', open: 175.77, high: 179.49, low: 175.44, close: 178.53 },
      { time: '2018-10-24', open: 178.58, high: 182.37, low: 176.31, close: 176.97 },
      { time: '2018-10-25', open: 177.52, high: 180.50, low: 176.83, close: 179.07 },
      { time: '2018-10-26', open: 176.88, high: 177.34, low: 170.91, close: 172.23 },
      { time: '2018-10-29', open: 173.74, high: 175.99, low: 170.95, close: 173.20 },
      { time: '2018-10-30', open: 173.16, high: 176.43, low: 172.64, close: 176.24 },
      { time: '2018-10-31', open: 177.98, high: 178.85, low: 175.59, close: 175.88 },
      { time: '2018-11-01', open: 176.84, high: 180.86, low: 175.90, close: 180.46 },
      { time: '2018-11-02', open: 182.47, high: 183.01, low: 177.39, close: 179.93 },
      { time: '2018-11-05', open: 181.02, high: 182.41, low: 179.30, close: 182.19 }
  ];

  const connectToIB = async() =>{
    let api = new Client({
      host: '127.0.0.1',
      port: 4001,
    });
  
    let time = await api.getCurrentTime();
    console.log('current time: ' + time);
  }
  
  const [stockProperty, setStockProperty] = useState({
    symbol:"AAPL",
    interval:"1D",
  })

  const onStockPropertyCondition = (e) =>{
    const {name,value} = e.target
    setStockProperty({
      ...stockProperty,[name]:value
    })
  }

  const getStockPriceData = () =>{
    console.log("stock data",stockProperty);
    axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockProperty.symbol}&interval=${stockProperty.interval}&apikey=demo`).then((result)=>{
      console.log("result", result.data)
    })

  }

  return (
    <div className="container">
      <div className='row'>
        <div className='col-md-8'>
            <h4 className='text-center'>Tradingview</h4>
            <div className='d-flex justify-content-between'>
              <div>
                <input className='form-control' placeholder='AAPL' name='symbol' onChange={onStockPropertyCondition}/>
              </div>
              <div>
                <select className='form-control' name='interval' onChange={onStockPropertyCondition}>
                  <option value={"1min"}>1min</option>
                  <option value={"5min"}>5min</option>
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
              <TradingViewChart></TradingViewChart>
            </div>
        </div>
        <div className='col-md-4'>
            <h4 className='text-center'>Setting</h4>
        </div>
      </div>
    </div>
  );
}

export default App;
