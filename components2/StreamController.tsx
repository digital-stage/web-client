import styles from './StreamController.module.css'
import Button from '../ui/Button'
import useSelectedDevice from '../hooks/useSelectedDevice'

const StreamController = () => {
    const { devices } = useSelectedDevice()
    return (
        <div className={styles.wrapper}>
            <select />
            <Button round small />
        </div>
    )
}
export default StreamController
