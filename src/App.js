import logo from './logo.svg';
import './App.css';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { Client } from 'ib-tws-api';

function App() {


  useEffect(() => {

    connectToIB().then(() => {
      console.log('finish');
      process.exit();}).catch((e) => {
        console.log('failure');
        console.log(e);
        process.exit();
    });

    return () => {
      
    }
  }, [])

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
        </div>
        <div className='col-md-4'>
            <h4 className='text-center'>Setting</h4>
        </div>
      </div>
    </div>
  );
}

export default App;
