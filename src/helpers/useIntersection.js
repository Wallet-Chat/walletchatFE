import { useState, useEffect } from 'react'

export const useIntersection = (element, rootMargin) => {
    const [isVisible, setState] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setState(entry.isIntersecting)
                    observer.unobserve(element.current)
                }
            }, { rootMargin }
        )

        element.current && observer.observe(element.current)

        return () => observer.unobserve(element.current)
    }, [])

    return isVisible
};