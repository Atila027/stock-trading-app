import logo from './logo.svg';
import './App.css';
import { useState,useEffect } from 'react';
import axios from 'axios';
import { Client } from 'ib-tws-api';

import TradingViewChart from './components/tradingviewchart';


function App() {

  // variable declartion

  const API_KEY = '';
  const BASE_URL = 'https://api.interactivebrokers.com/v1';
  const [stockProperty, setStockProperty] = useState({
    symbol:"TSLA",
    interval:"1D",
  })

  const [strategySetting, setStrategySetting] = useState({
    quantity:1000,
    buy_only:true,
    short_only:false,
    volume_filter:false,
    length_rsi:14,
    ema_l_daily:50,
    ema_l_weekly:50,
    ema_l_monthly:50,
    ob_d:50,
    ob_w:50,
    ob_m:50,
    os_d:50,
    os_w:50,
    os_m:50,
    rsi_tf2:'1 day',
    rsi_tf3:'1 week',
    rsi_tf4:'1 month',
    rsi_exittf2:'1 day',
    rsi_exittf3:'1 week',
    rsi_exittf4:'1 month',
    rsi_daily_exit_confirmation:true,
    rsi_weekly_exit_confirmation:false,
    rsi_monthly_exit_confirmation:false,
    ema_exittf2:'1 day',
    ema_exittf3:'1 week',
    ema_exittf4:'1 month',
    ema_daily_exit_confirmation:true,
    ema_weekly_exit_confirmation:false,
    ema_monthly_exit_confirmation:false,
    rsibuy_exit_daily:50,
    rsibuy_exit_weekly:50,
    rsibuy_exit_monthly:50,
    rsishort_exit_daily:50,
    rsishort_exit_weekly:50,
    rsishort_exit_monthly:50,
  })

  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState(
    {
      price:[],
      volume:[],
      area:[],
    }
  )

  const [orderInfo, setOrderInfo] = useState([]);

  const [isAutomating, setIsAutomating] = useState(false)

  useEffect(() => {
      getStockPriceData();
      connectToIB();
      if(localStorage.getItem('strategySettingStore') !== null){
        setStrategySetting(JSON.parse(localStorage.getItem('strategySettingStore')))
      }
      const orderRecord = localStorage.getItem('orderRecord');
      console.log("orderRecordData",orderRecord)
      if(orderRecord !== null){
        setOrderInfo(JSON.parse(orderRecord))
      }else{
        setOrderInfo([]);
      }
      
  },[])

  useEffect(() => {
    // getStockPriceData();
  },[stockProperty])

  useEffect(() => {
    localStorage.setItem('orderRecord',JSON.stringify(orderInfo));
  }, [orderInfo])
  
  
  

  const onStockPropertyCondition = (e) =>{
    const {name,value} = e.target
    setStockProperty({
      ...stockProperty,[name]:value
    })
  }

  const onStrategySettingChangeHandler = (e) =>{
    const {name,value} = e.target
    setStrategySetting({
      ...strategySetting,[name]:value
    })
  }

  const onSaveStrategyHandler = () =>{
    localStorage.setItem("strategySettingStore",JSON.stringify(strategySetting));
  }

  const getStockPriceData = () =>{
    setLoading(true)

    let vol = [];
    let arr = [];
    let mov = [];
    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockProperty.symbol}&outputsize=full&apikey=A3QPG0GAAYX8VGI2`;
    axios.get(API_Call).then((result)=>{
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

  const connectToIB = () =>{
    const url = `${BASE_URL}/portfolio/${API_KEY}/t=1`;
    axios.get(url).then((response)=>{
      console.log(response);
    }).catch((err)=>{
      console.log(err);
    })
  }

  const buyStock = () =>{
    const d = new Date();
    setOrderInfo([...orderInfo,{
      symbol:stockProperty.symbol,
      side:"market",
      type:'Buy',
      quantity:strategySetting.quantity,
      day:d.getHours() + " : " + d.getMinutes() + " : " + d.getSeconds() + " " + d.toLocaleDateString()
    }])
  }

  const sellStock = () =>{
    const d = new Date();
    setOrderInfo([...orderInfo,{
      symbol:stockProperty.symbol,
      side:"market",
      type:'Sell',
      quantity:strategySetting.quantity,
      day:d.getHours() + " : " + d.getMinutes() + " : " + d.getSeconds() + " " + d.toLocaleDateString()
    }]);
  }

  return (
    <div className="container-fluid">
      <div className='row'>
        <div className='col-md-8 tradingview-panel'>
            <h2 className='text-center p-3 text-uppercase'>Bassam's Tradingview</h2>
            <div className='row justify-content-between'>
              <div className='col-md-4'>
                <div className='input-group'>
                  <span className="input-group-text">Symbol</span>
                  <input 
                    className='form-control' 
                    placeholder='AAPL' 
                    name='symbol'
                    value={stockProperty.symbol}
                    onChange={onStockPropertyCondition}/>
                </div>
              </div>             
              <div className='form-group col-md-4 d-flex'>
              <span className="input-group-text">Interval</span>
                <select 
                  className='form-control' 
                  name='interval' 
                  onChange={onStockPropertyCondition}>
                  <option defaultValue={"1D"}>1D</option>
                  <option defaultValue={"1W"}>1W</option>
                  <option defaultValue={"1M"}>1M</option>
                </select>
              </div>
              <div className='col-md-4 d-flex justify-content-between'>
                <div>
                   <button className='btn btn-primary' onClick={getStockPriceData}>Search</button>
                </div>
                <div>
                  <button className='btn btn-outline-primary mr-10' onClick={buyStock}>Buy</button>
                  <button className='btn btn-outline-warning' onClick={sellStock}>Sell</button>
                </div>
              </div>
            </div>
            <div className="w-100 mt-3">
              {!loading && <TradingViewChart propsMarketData = {marketData}/>}

              <div className='mt-5'>
                  <button className='btn btn-primary' onClick={()=>setIsAutomating(!isAutomating)}>{isAutomating? "Automating..." : "Automate"}</button>
              </div>
              <table className='table table-info table-hover table-bordered mt-4'>
                <thead>
                  <tr className='text-center'>
                    <th>No</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody className='text-center'>
                  {orderInfo.map((item,i)=>{
                    return (
                      <tr>
                        <td>{i+1}</td>
                        <td>{item.symbol}</td>
                        <td>{item.side}</td>
                        <td>{item.type}</td>
                        <td>{item.quantity}</td>
                        <td>{item.day}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
        </div>
        <div className='col-md-4 setting-panel'>
            <h2 className='text-center text-uppercase p-3'>rsi mtf strategy</h2>
            <form>
              {/* quantity */}
              <div className="input-group">
                <span className="input-group-text text-uppercase">quantity</span>
                <input 
                  type="number" 
                  className="form-control" 
                  name='quantity' 
                  onChange={onStrategySettingChangeHandler}
                  value={strategySetting.quantity}/>
              </div>
              {/* buy & short only */}
              <div className='form-group'>
                <p>BUY & SHORT ONLY</p>
                <div className='d-flex'>
                  <div className='form-group mr-10'>
                    <input 
                      type='checkbox' 
                      className='form-check-input mr-10' 
                      id='buy-only'
                      checked={strategySetting.buy_only}
                      onChange={()=>setStrategySetting({
                        ...strategySetting,buy_only:!strategySetting.buy_only
                      })}
                      />
                    <label className='text-uppercase' htmlFor='buy-only' name='buy_only'>buy only</label>
                  </div>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input mr-10' 
                      id='short-only'
                      checked={strategySetting.short_only}
                      onChange={()=>setStrategySetting({
                        ...strategySetting,short_only : !strategySetting.short_only
                      })}
                      />
                    <label className='text-uppercase' htmlFor='short-only' name='short_only'>short only</label>
                  </div>
                </div>
              </div>
              {/* volum filter */}
              <div className='form-group'>
                <p className='text-uppercase'>indicator confirmation with volume filter</p>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input mr-10' 
                      id='volume-filter-possible'
                      checked={strategySetting.volume_filter}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting,volume_filter : !strategySetting.volume_filter
                        })
                      }}
                      />
                    <label className='text-uppercase ml-3' htmlFor='volume-filter-possible' name='volume_filter'>volume filter</label>
                  </div>
              </div>
              {/* indicator setting */}
              <div className='form-group'>
                <p className='text-uppercase'>inidcator settings</p>
                <div>
                  <div className='d-flex'>
                    <div className="input-group">
                      <span className="input-group-text text-uppercase">length rsi</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='length_rsi'
                        value={strategySetting.length_rsi} 
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">ema_l daily</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ema_l_daily' 
                        value={strategySetting.ema_l_daily}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                  </div>
                  <div className='d-flex'>
                    <div className="input-group">
                      <span className="input-group-text text-uppercase">ema_l weekly</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ema_l_weekly' 
                        value={strategySetting.ema_l_weekly}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">ema_l monthly</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ema_l_monthly' 
                        value={strategySetting.ema_l_monthly}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                  </div>
                </div>
              </div>
              {/* rsi overbought settings */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi overbought settings</p>
                <div className='d-flex'>
                    <div className="input-group">
                      <span class="input-group-text text-uppercase">ob-d</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ob_d' 
                        value={strategySetting.ob_d}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">ob-w</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ob_w' 
                        value={strategySetting.ob_w}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">ob-m</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='ob_m' 
                        value={strategySetting.ob_m}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                </div>
              </div>
              {/* oversold setting */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi oversold settings</p>
                <div className='d-flex'>
                    <div className="input-group">
                      <span className="input-group-text text-uppercase">os-d</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='os_d' 
                        value={strategySetting.os_d}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">os-w</span>
                      <input 
                        type="number" 
                        className="form-control"           
                        name='os_w' 
                        value={strategySetting.os_w}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                    <div className="input-group ml-2">
                      <span className="input-group-text text-uppercase">os-m</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        name='os_m' 
                        value={strategySetting.os_m}
                        onChange={onStrategySettingChangeHandler}/>
                    </div>
                </div>
              </div>
              {/* rsi timeframe setting */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi timeframe settings</p>
                <div className='d-flex'>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_TF2 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_tf2'
                      value={strategySetting.rsi_tf2}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day' selected>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_TF3 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_tf3'
                      value={strategySetting.rsi_tf3}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week' selected>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_TF4 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_tf4'
                      value={strategySetting.rsi_tf4}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month' selected>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* rsiexit timeframe settings */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi-exit timeframe settings</p>
                <div className='d-flex'>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_exittf2 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_exittf2'
                      value={strategySetting.rsi_exittf2}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day' selected>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_exittf3 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_exittf3'
                      value={strategySetting.rsi_exittf3}
                      onChange={onStrategySettingChangeHandler}
                      >
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week' selected>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>RSI_exittf4</label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='rsi_exittf4'
                      value={strategySetting.rsi_exittf4}
                      onChange={onStrategySettingChangeHandler}
                      >
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month' selected>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* rsi-mtf exit */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi-mtf exit</p>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='rsi-daily-exit-confirmation' 
                      name ='rsi_daily_exit_confirmation'
                      checked={strategySetting.rsi_daily_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, rsi_daily_exit_confirmation : !strategySetting.rsi_daily_exit_confirmation
                        })
                      }}
                      ></input>
                    <label className='text-uppercase' htmlFor='rsi-daily-exit-confirmation'>rsi-daily-exit-confirmation</label>
                  </div>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='rsi-weekly-exit-confirmation' 
                      name ='rsi_weekly_exit_confirmation'
                      checked={strategySetting.rsi_weekly_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, rsi_weekly_exit_confirmation : !strategySetting.rsi_weekly_exit_confirmation
                        })
                      }}
                      ></input>
                    <label className='text-uppercase' htmlFor='rsi-weekly-exit-confirmation'>rsi-weekly-exit-confirmation</label>
                  </div>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='rsi-monthly-exit-confirmation' 
                      name ='rsi_monthly_exit_confirmation'
                      checked={strategySetting.rsi_monthly_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, rsi_monthly_exit_confirmation : !strategySetting.rsi_monthly_exit_confirmation
                        })
                      }}
                      ></input>
                    <label className='text-uppercase' htmlFor='rsi-monthly-exit-confirmation'>rsi-monthly-exit-confirmation</label>
                  </div>
              </div>
              {/* ema exit timeframe settings */}
              <div className='form-group'>
                <p className='text-uppercase'>ema-exit timeframe settings</p>
                <div className='d-flex'>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>ema_exittf2 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='ema_exittf2'
                      value={strategySetting.ema_exittf2}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day' selected>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>ema_exittf3 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='ema_exittf3'
                      value={strategySetting.ema_exittf3}
                      onChange={onStrategySettingChangeHandler}>
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week' selected>1 week</option>
                      <option defaultValue='1 month'>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                  <div className='form-group'>
                    <label className='text-uppercase d-inline-block'>ema_exittf4 </label>
                    <select 
                      className='form-control-sm d-inline-block ml-2' 
                      name='ema_exittf4'
                      value={strategySetting.ema_exittf4}
                      onChange={onStrategySettingChangeHandler}
                      >
                      <option defaultValue='1 second'>1 second</option>
                      <option defaultValue='5 seconds'>5 seconds</option>
                      <option defaultValue='10 seconds'>10 seconds</option>
                      <option defaultValue='15 seconds'>15 seconds</option>
                      <option defaultValue='30 seconds'>30 seconds</option>
                      <option defaultValue='1 minute'>1 minute</option>
                      <option defaultValue='3 minutes'>3 minutes</option>
                      <option defaultValue='5 minutes'>5 minutes</option>
                      <option defaultValue='15 minutes'>10 minutes</option>
                      <option defaultValue='30 minutes'>30 minutes</option>
                      <option defaultValue='45 minutes'>45 minutes</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='2 days'>2 days</option>
                      <option defaultValue='3 days'>3 days</option>
                      <option defaultValue='4 days'>4 days</option>
                      <option defaultValue='1 day'>1 day</option>
                      <option defaultValue='1 week'>1 week</option>
                      <option defaultValue='1 month' selected>1 month</option>
                      <option defaultValue='3 months'>3 months</option>
                      <option defaultValue='6 months'>6 months</option>
                      <option defaultValue='12 months'>12 months</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* ema mtf exit */}
              <div className='form-group'>
                <p className='text-uppercase'>ema-mtf exit</p>
                <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='ema-daily-exit-confirmation' 
                      name ='ema_daily_exit_confirmation'
                      checked={strategySetting.ema_daily_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, ema_daily_exit_confirmation : !strategySetting.ema_daily_exit_confirmation
                        })
                      }}
                      />
                    <label className='text-uppercase' htmlFor='ema-daily-exit-confirmation'>ema-daily-exit-confirmation</label>
                  </div>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='ema-weekly-exit-confirmation' 
                      name ='ema_weekly_exit_confirmation'
                      checked={strategySetting.ema_weekly_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, ema_weekly_exit_confirmation : !strategySetting.ema_weekly_exit_confirmation
                        })
                      }}
                      />
                    <label className='text-uppercase' htmlFor='ema-weekly-exit-confirmation'>ema-weekly-exit-confirmation</label>
                  </div>
                  <div className='form-group'>
                    <input 
                      type='checkbox' 
                      className='form-check-input' 
                      id='ema-monthly-exit-confirmation' 
                      name ='ema_monthly_exit_confirmation'
                      checked={strategySetting.ema_monthly_exit_confirmation}
                      onChange={()=>{
                        setStrategySetting({
                          ...strategySetting, ema_monthly_exit_confirmation : !strategySetting.ema_monthly_exit_confirmation
                        })
                      }}
                      />
                    <label className='text-uppercase' htmlFor='ema-monthly-exit-confirmation'>ema-monthly-exit-confirmation</label>
                  </div>
              </div>
              {/* rsi-buy exit settings */}
              <div className='form-group'>
                <p className='text-uppercase'>rsi-buy exit settings</p>
                <div className='row'>
                  <div className="input-group col-md-5">
                    <span className="input-group-text text-uppercase">rsibuy_exit-daily</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsibuy_exit_daily'
                      value={strategySetting.rsibuy_exit_daily}
                      onChange={onStrategySettingChangeHandler}/>
                  </div>
                  <div className="input-group col-md-5">
                    <span className="input-group-text text-uppercase">rsibuy_exit-weekly</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsibuy_exit_weekly'
                      value={strategySetting.rsibuy_exit_weekly}
                      onChange={onStrategySettingChangeHandler}
                      />
                  </div>
                  <div className="input-group col-md-5">
                    <span className="input-group-text text-uppercase">rsibuy_exit-monthly</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsibuy_exit_monthly'
                      value={strategySetting.rsibuy_exit_monthly}
                      onChange={onStrategySettingChangeHandler}
                      />
                  </div>
                </div>
              </div>
              <div className='form-group'>
                <p className='text-uppercase'>rsi-short exit settings</p>
                <div className='row'>
                  <div className="input-group">
                    <span className="input-group-text text-uppercase">rsishort_exit-daily</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsishort_exit_daily'
                      value={strategySetting.rsishort_exit_daily}
                      onChange={onStrategySettingChangeHandler}
                      />
                  </div>
                  <div className="input-group">
                    <span className="input-group-text text-uppercase">rsishort_exit-weekly</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsishort_exit_weekly'
                      value={strategySetting.rsishort_exit_weekly}
                      onChange={onStrategySettingChangeHandler}
                      />
                  </div>
                  <div className="input-group">
                    <span className="input-group-text text-uppercase">rsishort_exit-monthly</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      name='rsishort_exit_monthly'
                      value={strategySetting.rsishort_exit_monthly}
                      onChange={onStrategySettingChangeHandler}
                      />
                  </div>
                </div>
              </div>
              <div className='form-group mt-5'>
                <div className='d-flex'>
                  <button className='btn btn-outline-warning'>Cancel</button>
                  <button className='btn btn-outline-primary' onClick={onSaveStrategyHandler}>Ok</button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}

export default App;
