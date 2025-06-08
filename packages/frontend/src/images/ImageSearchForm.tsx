import React from "react";

interface IImageSearchFormProps {
  searchString: string;
  onSearchStringChange: (searchString: string) => void;
  onSearchRequested: () => void;
}

export function ImageSearchForm(props: IImageSearchFormProps) {
  const { searchString, onSearchStringChange, onSearchRequested } = props;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 
    onSearchRequested(); 
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1em" }}>
      <label>
        Search for images:
        <input
          name="searchQuery"
          value={searchString}
          onChange={(e) => onSearchStringChange(e.target.value)}
          style={{
            marginLeft: "0.5em",
            width: "100%",
            maxWidth: "20em",
            display: "inline-block",
          }}
        />
      </label>
      <input type="submit" value="Search" style={{ marginLeft: "1em" }} />
    </form>
  );
}
