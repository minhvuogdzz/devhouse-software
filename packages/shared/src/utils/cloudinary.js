export const buildCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  const {
    cloudName = 'devhouse',
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  const transformSegment = transforms.length > 0 ? `${transforms.join(',')}/` : '';
  const cleanId = publicId.replace(/^\//, '');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformSegment}${cleanId}`;
};
