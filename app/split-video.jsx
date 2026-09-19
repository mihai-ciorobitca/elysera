'use client'

import ScrollMedia from './scroll-media'

export default function SplitVideo({src,poster,alt}){
 return <ScrollMedia source={src}><img src={poster} alt={alt} loading="lazy" decoding="async"/></ScrollMedia>
}
