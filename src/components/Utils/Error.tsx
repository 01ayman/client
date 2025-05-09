interface ErrorProps {
  label: string;
}

const errorStyle = {
  backgroundColor: '#FF0000',
  padding: '10px',
  borderRadius: '5px',
  color: '#FFFFFF',
  marginTop: '10px',
};

const ChessError = ({ label}: ErrorProps) => {
  return <div style={errorStyle}>{label}</div>;
};

export default ChessError;
