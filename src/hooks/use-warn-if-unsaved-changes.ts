"use client"

import { useEffect, useRef } from "react"

export const useWarnIfUnsavedChanges = (unsaved: boolean, message?: string) => {
  const defaultMessage =
    message ??
    "Changes you made has not been saved just yet. Do you wish to proceed anyway?"

  const allowNavigationRef = useRef(false)

  useEffect(() => {
    if (!unsaved) {
      allowNavigationRef.current = false
      return
    }

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement
      const targetUrl = target.href
      const currentUrl = window.location.href

      if (targetUrl && targetUrl !== currentUrl && !allowNavigationRef.current) {
        const shouldLeave = confirm(defaultMessage)
        if (!shouldLeave) {
          e.preventDefault()
          e.stopPropagation()
        } else {
          allowNavigationRef.current = true
          setTimeout(() => {
            allowNavigationRef.current = false
          }, 100)
        }
      }
    }

    const handleMutation = () => {
      const anchorElements = document.querySelectorAll("a[href]")
      anchorElements.forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick as EventListener)
        anchor.addEventListener("click", handleAnchorClick as EventListener)
      })
    }

    const mutationObserver = new MutationObserver(handleMutation)
    mutationObserver.observe(document, { childList: true, subtree: true })

    handleMutation()

    return () => {
      mutationObserver.disconnect()
      const anchorElements = document.querySelectorAll("a[href]")
      anchorElements.forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick as EventListener)
      })
    }
  }, [unsaved, defaultMessage])

  useEffect(() => {
    if (!unsaved) return

    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = defaultMessage
      return defaultMessage
    }

    window.addEventListener("beforeunload", beforeUnloadHandler)

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
  }, [unsaved, defaultMessage])
}
