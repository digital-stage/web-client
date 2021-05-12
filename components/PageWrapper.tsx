import React, {useEffect, useRef} from 'react'
import {useMediasoup, useStageSelector} from '@digitalstage/api-client-react'
import styles from './PageWrapper.module.css'
import NavigationBar from './navigation/NavigationBar'
import Background from '../ui/surface/Background'
import GlobalDeviceController from './global/GlobalDeviceController'
import MobileMenu from "./navigation/MobileMenu";

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
      {Object.values(audioConsumers).map((consumer) => (
        <AudioPlayer track={consumer.track}/>
      ))}
    </>
  )
}

const PageWrapper = (props: { children: React.ReactNode }) => {
  const {children} = props
  const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
  return (
    <div className={styles.wrapper}>
      <div className={styles.backgroundWrapper}>
        <Background insideStage={insideStage}/>
      </div>
      <div className={styles.sidebar}>
        <NavigationBar/>
      </div>
      <div className={styles.content}>{children}</div>
      <StageAudioPlayer/>
      <GlobalDeviceController/>
      <MobileMenu/>
    </div>
  )
}
export default PageWrapper
