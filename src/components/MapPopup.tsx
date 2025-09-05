import type { Location } from "../helper"
import { Button } from 'antd'

const MapPopup = ({ location, onClick, isActive }: { location: Location, onClick?: React.MouseEventHandler<HTMLElement>, isActive: boolean }) => {

  return (
    <div className="portal-content">
      <table>
        <tbody>
          <tr>
            <td><strong>Tên</strong></td>
            <td>{location.name}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex-row flex-end popup-footer">
        <Button onClick={onClick} size='small'>
          { isActive ? 'Đóng bản đồ' : 'Mở xem' }
        </Button>
      </div>
    </div>
  )
}

export default MapPopup
