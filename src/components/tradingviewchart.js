import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { createChart, CrosshairMode } from "lightweight-charts";

const TradingViewChart = (propsMarketData) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const resizeObserver = useRef();

  useEffect(() => {
  
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 700,
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

    candleSeries.setMarkers([
      {
        time: "2019-04-09",
        position: "aboveBar",
        color: "black",
        shape: "arrowDown",
        text: "sell",
      },
      {
        time: "2019-05-31",
        position: "belowBar",
        color: "red",
        shape: "arrowUp",
        id: "id3"
      },
      {
        time: "2019-05-31",
        position: "belowBar",
        color: "orange",
        shape: "arrowUp",
        id: "id4",
        text: "buy",
        size: 1
      }
    ]);

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
      volumeSeries.setData(propsMarketData.propsMarketData.volume);
    }

    const RSI_D = chart.current.addLineSeries({
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

    const RSI_W = chart.current.addLineSeries({
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

    const RSI_M = chart.current.addLineSeries({
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
  },[propsMarketData.propsMarketData]);

  // Resize chart on container resizes.
  useEffect(() => {}, []);

  return (
    <div className="App">
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
}

export default TradingViewChart

