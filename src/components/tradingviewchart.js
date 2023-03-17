import React, { useState, useEffect, useRef, useContext } from "react";
import ReactDOM from "react-dom";
import { createChart, CrosshairMode } from "lightweight-charts";
import { RSI } from 'technicalindicators';

import { globalStore } from "../store";

const TradingViewChart = (propsMarketData) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();

  const globalValue = useContext(globalStore);

  const [isLoading, setIsLoading] = useState(false)
  
  const [orderSignal, setOrderSignal] = useState([]);
  
  const calculateRSI = (data, index, timePeriod) => {
    let avgGain = 0;
    let avgLoss = 0;
  
    // Calculate average gain and loss
    for (let i = 1; i <= timePeriod; i++) {
      if(data[i + index].close){
        const diff = data[i + index].close - data[i + index - 1].close;
        if (diff > 0) {
          avgGain += diff;
        } else {
          avgLoss += Math.abs(diff);
        }
      }else{
        i++
      }
      
    }
  
    avgGain /= timePeriod;
    avgLoss /= timePeriod;
  
    // Calculate RS and RSI
    const RS = avgGain / avgLoss;
    const RSI = 100 - (100 / (1 + RS));
  
    return RSI;
  }

  // const strategySignal = (data) =>{


  //   const settings = globalValue.strategySetting;
  //   const RSI_D = calculateRSI(data,300);
  //   const RSI_W = calculateRSI(data,7);
  //   const RSI_M = calculateRSI(data,30);

  //   const isBuy = RSI_D > settings.ob_d && RSI_W > settings.ob_w && RSI_M > settings.ob_m
  //   const isSell = RSI_D < settings.ob_d && RSI_W < settings.ob_w && RSI_M < settings.ob_m

  //   return{
  //     buy:isBuy,
  //     sell:isSell,
  //   }
  // }

  useEffect(() => {
    return () => {
      globalValue.orderInfo.map((item,i)=>{
        return(
          setOrderSignal([...orderSignal,{
            time: item.day.slice(0,10),
            position: item.type === 'Sell'? 'aboveBar' : 'belowBar',
            color: item.type === 'Sell'? 'yellow' : 'blue',
            shape: item.type === 'Sell'? 'arrowDown' : 'arrowUp',
            text: item.type
          }])
        )
      });

    }
  }, [])

  console.log('order signal', orderSignal)

  useEffect(() => {
  
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        backgroundColor: "#253248",
        textColor: "rgba(255, 123, 0, 0.9)"
      },
      grid: {
        vertLines: {
          color: "#334158"
        },
        horzLines: {
          color: "#334158"
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      priceScale: {
        borderColor: "#485c7b"
      },
      timeScale: {
        borderColor: "#485c7b"
      }
    });

    const candleSeries = chart.current.addCandlestickSeries({
      upColor: "#4bffb5",
      downColor: "#ff4976",
      borderDownColor: "#ff4976",
      borderUpColor: "#4bffb5",
      wickDownColor: "#838ca1",
      wickUpColor: "#838ca1"
    });

    const areaSeries = chart.current.addLineSeries({
      color: "#f48fb1",
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBackgroundColor: "#2296f3",
      lineType: 1,
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 800,
          maxValue: 2700
        },
        margins: {
          above: 100,
          below: 100
        }
      })
    });

    // globalValue.orderInfo.map((item,i)=>{
    //   return(
    //     setOrderSignal([...orderSignal,{
    //       time: item.day.slice(0,10),
    //       position: item.type === 'Sell'? 'aboveBar' : 'belowBar',
    //       color: item.type === 'Sell'? 'black' : 'blue',
    //       shape: item.type === 'Sell'? 'arrowDown' : 'arrowUp',
    //       text: item.type
    //     }])
    //   )
    // });

    console.log('orderSignal new',globalValue.orderSignal)
    candleSeries.setMarkers(globalValue.orderSignal);

    chart.current.subscribeCrosshairMove((param) => {
      // console.log(param.hoveredMarkerId);
    });

    chart.current.subscribeClick((param) => {
      //console.log(param.hoveredMarkerId);
    });

    const priceLine = areaSeries.createPriceLine({
      price: 2500.0,
      color: "green",
      lineWidth: 2,

      axisLabelVisible: true,
      title: "P/L 500"
    });

    priceLine.applyOptions({
      price: 2000.0,
      color: "red",
      lineWidth: 3,
      axisLabelVisible: true,
      title: "P/L 600"
    });
    const coordinate = areaSeries.priceToCoordinate(250.50);
    const screenshot = chart.current.takeScreenshot();
    const volumeSeries = chart.current.addHistogramSeries({
      color: "#182233",
      lineWidth: 4,
      priceFormat: {
        type: "volume"
      },
      overlay: true,
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    // 
    if(propsMarketData.propsMarketData.price.length == 0){
      candleSeries.setData([]);
    }else{
      candleSeries.setData(propsMarketData.propsMarketData.price);
      areaSeries.setData(propsMarketData.propsMarketData.area)
      // volumeSeries.setData(propsMarketData.propsMarketData.volume);
    }

    const RSI_D_Series = chart.current.addLineSeries({
      color: "green",
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBackgroundColor: "#2296f3",
      lineType: 1,
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 800,
          maxValue: 2700
        },
        margins: {
          above: 100,
          below: 100
        }
      })
    });

    const RSI_W_Series = chart.current.addLineSeries({
      color: "blue",
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBackgroundColor: "#2296f3",
      lineType: 1,
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 800,
          maxValue: 2700
        },
        margins: {
          above: 100,
          below: 100
        }
      })
    });

    const RSI_M_Series = chart.current.addLineSeries({
      color: "#f48fb1",
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#ffffff",
      crosshairMarkerBackgroundColor: "#2296f3",
      lineType: 1,
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 800,
          maxValue: 2700
        },
        margins: {
          above: 100,
          below: 100
        }
      })
    });


    // volumeSeries.setData(volumeData);
    
    // resizeObserver.current = new ResizeObserver((entries) => {
    //   const { width, height } = entries[0].contentRect;
    //   chart.current.applyOptions(800,500);
      
    // });
  
    // resizeObserver.current.observe(chartContainerRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.current.remove();
    }
    setTimeout(() => {
      chart.current.timeScale().fitContent();
    }, 0);
  },[propsMarketData.propsMarketData, globalValue]);


  console.log('order signal', orderSignal);

  return (
    <div className="chart-channel">
      {!isLoading && <div ref={chartContainerRef} className="chart-container" />}
    </div>
  );
}

export default TradingViewChart

