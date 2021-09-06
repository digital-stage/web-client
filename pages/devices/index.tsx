import {DevicesList} from '../../components/devices/DevicesList'
import {Container} from '../../ui/Container'

const Index = () => {
    return (
        <Container size="small">
            <h2>Meine Geräte</h2>
            <DevicesList />
        </Container>
    )
}
export default Index
