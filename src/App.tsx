import { useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'
import { Tabs } from 'antd'
import Map from './Map'
import MapList from './MapList';
import News from './News';
import Projects from './Projects';
import History from './History';
import InterestRates from './InterestRates';

function tabSwicher(tab: string) {
  switch (tab) {
    case "map":
      return <Map />
    case "map-list":
      return <MapList />
    case "news":
      return <News />
    case "projects":
      return <Projects />
    case "history":
      return <History />
    case "interest":
      return <InterestRates />
    default:
      return <></>
  }
}

function App() {
  const [tab, setTab] = useState("map")

  return (
    <div id="main-content">
      <Tabs
        defaultActiveKey="map"
        onChange={setTab}
        id="ctl-panel"
        items={[
          {
            id: "map",
            key: "map",
            label: "Bản đồ",
          },
          {
            id: "map-list",
            key: "map-list",
            label: "Danh Sách bản đồ",
          },
          {
            id: "news",
            key: "news",
            label: "Tin tức",
          },
          {
            id: "projects",
            key: "projects",
            label: "Dự án",
          },
          {
            id: "history",
            key: "history",
            label: "Lịch Sử giá",
          },
          {
            id: "interest",
            key: "interest",
            label: "Tính lãi xuất",
          }
        ]}
      />
      {
        tabSwicher(tab)
      }
    </div>
  )
}

export default App

