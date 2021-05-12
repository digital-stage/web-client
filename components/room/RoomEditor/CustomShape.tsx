import { Image, Transformer, Text } from 'react-konva';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import RoomElement from './RoomElement';

const SIZE = 96;

const CustomShape = (props: {
  element: RoomElement;
  onChange?: (x: number, y: number, rZ: number) => void;
  onFinalChange?: (x: number, y: number, rZ: number) => void;
  onClick?: () => void;
  selected?: boolean;
}): JSX.Element => {
  const { element, onChange, onFinalChange, selected, onClick } = props;
  const starRef = useRef<any>();
  const transformerRef = useRef<any>();
  const [dragging, setDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
    rZ: number;
  }>({
    x: 0,
    y: 0,
    rZ: 0,
  });

  /**
   * Sync element with internal position
   */
  useEffect(() => {
    setPosition({
      x: element.x,
      y: element.y,
      rZ: element.rZ,
    });
  }, [element]);

  const handleDragStart = () => {
    setDragging(true);
  };
  const handleDragMove = useCallback(() => {
    if (starRef) {
      const x: number = starRef.current.attrs.x;
      const y: number = starRef.current.attrs.y;
      setPosition((prev) => {
        if (onChange) {
          onChange(x, y, prev.rZ);
        }
        return {
          x,
          y,
          rZ: prev.rZ,
        };
      });
    }
  }, [onChange, starRef]);
  const handleDragEnd = useCallback(() => {
    setDragging(false);
    if (onFinalChange) {
      onFinalChange(position.x, position.y, position.rZ);
    }
  }, [position]);
  const handleTransform = () => {
    const degrees: number = transformerRef.current.attrs.rotation;
    setPosition((prev) => ({
      x: prev.x,
      y: prev.y,
      rZ: degrees,
    }));
  };
  const handleTransformEnd = useCallback(() => {
    if (onFinalChange) {
      onFinalChange(position.x, position.y, position.rZ);
    }
  }, [position]);

  useEffect(() => {
    if (transformerRef && transformerRef.current && starRef && starRef.current && selected) {
      // we need to attach transformer manually
      transformerRef.current.nodes([starRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selected, transformerRef, starRef]);

  return (
    <>
      <Image
        ref={starRef}
        id={element._id}
        key={element._id}
        x={position.x}
        y={position.y}
        width={SIZE}
        height={SIZE}
        offsetX={SIZE / 2}
        offsetY={SIZE / 2}
        image={element.image}
        opacity={element.opacity}
        draggable
        rotation={position.rZ}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.6}
        shadowOffsetX={dragging ? 10 : 5}
        shadowOffsetY={dragging ? 10 : 5}
        scaleX={dragging ? 1.2 : 1}
        scaleY={dragging ? 1.2 : 1}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onClick={() => onClick && onClick()}
        onTap={() => onClick && onClick()}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
      />
      {selected ? (
        <Transformer ref={transformerRef} resizeEnabled={false} rotateEnabled={true} />
      ) : undefined}
      <Text fill="#fff" x={position.x - SIZE / 2} y={position.y + SIZE / 2} text={element.name} />
    </>
  );
};

export default CustomShape;
