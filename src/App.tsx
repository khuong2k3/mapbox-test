import { useEffect, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'
import { Tabs } from 'antd'
import Map from './Map'
import MapList from './MapList';
import News from './News';
import Projects from './Projects';
import History from './History';
import InterestRates from './InterestRates';
import { Route, Routes, useNavigate } from 'react-router-dom';

function NotFound() {
  return (<div>asdf</div>)
}

function getSearchPath() {
  const url = new URL(window.location.href);
  const path = url.pathname.split("/")
  if (path.length > 0) {
    return path[0]
  } else {
    return undefined
  }

}

function App() {
  const [tab, setTab] = useState("map")
  const navigate = useNavigate()

  useEffect(() => {
    navigate(tab)
  }, [tab, navigate])

  return (
    <div id="main-content">
      <Tabs
        defaultActiveKey={getSearchPath()}
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

      <Routes>
        <Route path="/map" element={<Map />} />
        <Route path="/map-list" element={<MapList />} />
        <Route path="/news" element={<News />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/history" element={<History />} />
        <Route path="/interest" element={<InterestRates />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

    </div>
  )
}

export default App

      //{
      //  tabSwicher(tab)
      //}
