import React, {useEffect, useRef} from 'react'
import {useMediasoup} from '@digitalstage/api-client-react'
import styles from './PageWrapper.module.css'
import NavigationBar from './navigation/NavigationBar'

const AudioPlayer = (props: { track: MediaStreamTrack }) => {
  const {track} = props
  const audioRef = useRef<HTMLAudioElement>()
  useEffect(() => {
    if (audioRef) {
      audioRef.current.srcObject = new MediaStream([track])
      audioRef.current.autoplay = true
      audioRef.current.play()
    }
  }, [track, audioRef])
  return <audio autoPlay playsInline ref={audioRef}/>
}
const StageAudioPlayer = () => {
  const {audioConsumers} = useMediasoup()
  return (
    <>
      {Object.values(audioConsumers).map(consumer => <AudioPlayer track={consumer.track}/>)}
    </>
  )
}

const PageWrapper = (props: { children: React.ReactNode }) => {
  const {children} = props
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <NavigationBar/>
      </div>
      <div className={styles.content}>{children}</div>
      <StageAudioPlayer/>
    </div>
  )
}
export default PageWrapper
