
import SettingsIcon from '@mui/icons-material/Settings';
import style from './theme.module.scss'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
type Props = {
  open: boolean
  setOpen: (value: boolean) => void
}
export default function SettingToogle({ open, setOpen }: Props) {
  const settingRef = useRef<HTMLDivElement>(null)
  let offsetY = 0;  // 用于存储拖动偏移
  let startY = 0;
  function eventRegist(event: any) {
    settingRef.current!.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    console.log(event)
    if (event.button === 2) {
      settingRef.current!.addEventListener('mousemove', mouseMoveHandler);
      settingRef.current!.style.cursor = 'grabbing';

    } else {
      setOpen(!open)
    }

  }

  // 拖动过程中
  function mouseMoveHandler(event: any) {
    const currentY = event.clientY;
    const deltaY = currentY - startY;
    settingRef.current!.style.top = `${offsetY + deltaY - 15}px`;
  }

  // 松开鼠标
  function mouseUpHandler() {
    settingRef.current!.removeEventListener('mousemove', mouseMoveHandler);
    settingRef.current!.style.cursor = 'grab';
  }

  // 打开动画
  function openAnimation() {
    gsap.to(settingRef.current, {
      right: open ? '400px' : '0',
      duration: 0.2,
      ease: 'power2.inOut'
    })
  }
  useEffect(() => {
    openAnimation()
  }, [open])

  return (
    <div
      onMouseUp={() => mouseUpHandler()}
      onMouseDown={(event) => eventRegist(event)}
      ref={settingRef}
      className={style.toogler}>
      <SettingsIcon />
    </div>
  )
}
