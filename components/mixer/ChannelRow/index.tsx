/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react';
import { jsx, Flex, SxStyleProp } from 'theme-ui';

const ChannelRow = (props: { children?: React.ReactNode; sx: SxStyleProp }): JSX.Element => {
  const { children, sx } = props;
  return (
    <Flex
      sx={{
        flexDirection: 'row',
        flexWrap: 'nowrap',
        borderRadius: 'card',
        ...sx,
      }}
    >
      {children}
    </Flex>
  );
};
export default ChannelRow;
