import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../../src/components/ui/Button'

describe('Button Component', () => {
  it('应该渲染按钮文本', () => {
    render(<Button>点击我</Button>)
    
    expect(screen.getByRole('button', { name: '点击我' })).toBeInTheDocument()
  })

  it('应该处理点击事件', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>点击我</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态下不应该响应点击', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        禁用按钮
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('应该应用不同的变体样式', () => {
    const { rerender } = render(<Button variant="primary">主要按钮</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-500')
    
    rerender(<Button variant="secondary">次要按钮</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')
  })
})