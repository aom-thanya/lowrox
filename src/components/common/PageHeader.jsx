import React from 'react';

export default function PageHeader({ title, description }) {
  return (
    <div className="page-header">
      <h1 className="heading-2">{title}</h1>
      <p className="body-md">{description}</p>
    </div>
  );
}
