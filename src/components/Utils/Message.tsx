const messageStyle = {
    backgroundColor: "#163d16",
    padding: "10px",
    borderRadius: "5px",
    color: "#FFFFFF",
    marginTop: "10px",
  }
  
  export const Message = ({message}: {message: string}) => {
    return (
      <div style={messageStyle}>
        {message}
      </div>
    );
  };