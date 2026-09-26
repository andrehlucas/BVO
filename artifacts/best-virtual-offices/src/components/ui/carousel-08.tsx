import * as React from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'

export interface CarouselCardItem {
  id: string
  category: string
  title: React.ReactNode
  description: string
  imageSrc: string
}

interface AppleCardCarouselProps<T extends CarouselCardItem> {
  cards: T[]
  controlsId: string
  onSelect: (card: T) => void
  selectedId: T['id']
}

export default function AppleCardCarousel<T extends CarouselCardItem>({
  cards,
  controlsId,
  onSelect,
  selectedId,
}: AppleCardCarouselProps<T>) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    update()
    api.on('select', update)
    api.on('reInit', update)

    return () => {
      api.off('select', update)
      api.off('reInit', update)
    }
  }, [api])

  return (
    <div className="comparison-carousel">
      <Carousel
        aria-label="Choose a service to compare"
        className="comparison-carousel-viewport"
        opts={{ align: 'start', containScroll: 'trimSnaps', dragFree: true }}
        setApi={setApi}
      >
        <CarouselContent className="comparison-carousel-track">
          {cards.map((card, index) => {
            const selected = selectedId === card.id

            return (
              <CarouselItem className="comparison-carousel-slide" key={card.id}>
                <button
                  aria-controls={controlsId}
                  aria-pressed={selected}
                  className={`comparison-card${selected ? ' is-selected' : ''}`}
                  onClick={() => onSelect(card)}
                  type="button"
                >
                  <img alt="" decoding="async" loading="lazy" src={card.imageSrc} />
                  <span className="comparison-card-top">
                    <span>{card.category}</span>
                    <span aria-hidden="true">0{index + 1}</span>
                  </span>
                  <span className="comparison-card-bottom">
                    <strong>{card.title}</strong>
                    <span className="comparison-card-description">{card.description}</span>
                    <span className="comparison-card-action">
                      <span>{selected ? 'Choose a city below' : 'Explore this service'}</span>
                      <span aria-hidden="true" className="comparison-card-action-icon"><ArrowUpRight size={18} /></span>
                    </span>
                  </span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      <div className="comparison-carousel-controls">
        <span>Swipe to explore</span>
        <div>
          <Button
            aria-label="Previous service"
            className="comparison-carousel-control"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ArrowLeft size={18} />
          </Button>
          <Button
            aria-label="Next service"
            className="comparison-carousel-control"
            disabled={!canScrollNext}
            onClick={() => api?.scrollNext()}
            size="icon"
            type="button"
            variant="outline"
          >
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}