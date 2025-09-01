import { Box } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;

  return (
    <div hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}