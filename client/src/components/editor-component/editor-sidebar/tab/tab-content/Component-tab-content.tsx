import React from 'react'
import { ComponentButton } from 'src/components/editor-component/root-components/contents/helper/ComponentButton'
import { Code, Heading, Image, Menu, MousePointerClick, SeparatorHorizontal, Share2, Type } from 'lucide-react'

const ComponentTabContent = () => {

    const handleDragStart = (e : React.DragEvent, componentType  :string) => {
        e.dataTransfer.setData('componentType', componentType);
      };


  return (
    <div className="grid grid-cols-3 gap-2 p-4">
    <ComponentButton
      name="Text" 
      icon={<Type className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'text')} 
    />
    <ComponentButton
      name="Button" 
      icon={<MousePointerClick className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'button')} 
    />
    <ComponentButton 
      name="Divider" 
      icon={<SeparatorHorizontal className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'divider')} 
    />
    <ComponentButton 
      name="Image" 
      icon={<Image className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'image')} 
    />
    <ComponentButton 
      name="Heading" 
      icon={<Heading className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'heading')} 
    />
    <ComponentButton 
      name="Socials" 
      icon={<Share2 className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'socials')} 
    />
    <ComponentButton 
      name="Menu" 
      icon={<Menu className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'menu')} 
    />
    <ComponentButton 
      name="HTML" 
      icon={<Code className="h-4 w-4" />} 
      onDragStart={(e) => handleDragStart(e, 'html')} 
    />
  </div>
  )
}

export default ComponentTabContent