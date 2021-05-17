import styles from './StageView.module.css'

const StageView = () => {
  return (
    <div className={styles.wrapper}>
      <h2>Meine Bühnen</h2>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <button className={styles.panelHeaderAction}>
            Neue Bühne erstellen
          </button>
          <button className={styles.panelHeaderAction}>
            Neue Teilnahme
          </button>
        </div>
      </div>
    </div>
  )
}
export default StageView
