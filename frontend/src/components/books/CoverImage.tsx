import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AvailableCoverImageInterface } from "../../interfaces/book_and_bookshelf";

interface CoverImageProps {
  parentAvailableCoverImages: Partial<AvailableCoverImageInterface>[];
  parentSelectedCoverImage?: Partial<AvailableCoverImageInterface> | null;
  onSelectCoverImage: (
    bookCoverToSelect: Partial<AvailableCoverImageInterface>
  ) => void;
}

function CoverImage({
  parentAvailableCoverImages,
  parentSelectedCoverImage,
  onSelectCoverImage,
}: CoverImageProps) {
  const [availableCoverImages, setAvailableCoverImages] = useState<
    Partial<AvailableCoverImageInterface>[]
  >([]);

  // Sync state if the `availableCoverImages` prop changes
  useEffect(() => {
    setAvailableCoverImages(parentAvailableCoverImages);
  }, [parentAvailableCoverImages]);

  const hasRenderedFromParent = useRef(false);

  const [selectedCoverImage, setSelectedCoverImage] = useState<
    Partial<AvailableCoverImageInterface> | null | undefined
  >(null);

  const initialize = useCallback(async () => {
    if (parentSelectedCoverImage && !hasRenderedFromParent.current) {
      setSelectedCoverImage(parentSelectedCoverImage);
      // Track the fact that we have rendered this component
      // We don't want to overwrite our currentBook from the parent again
      hasRenderedFromParent.current = true;
    }
  }, [parentSelectedCoverImage]);

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
  ];

  const maxAllowedImageUploadSize = 5 * 1024 * 1024; // 5MB

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleButtonToSetCoverImageToUpload() {
    fileInputRef.current?.click();
  }

  function handleSetCoverImageToUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files === null || event.target.files.length === 0) {
      toast.error("No files were provided for upload", {
        position: "bottom-right",
        theme: "colored",
      });
      return;
    }
    const file_to_upload = event.target.files[0];
    if (!allowedMimeTypes.includes(file_to_upload.type)) {
      toast.error(
        `Only files of type ${allowedMimeTypes.join(" or ")} are allowed`,
        {
          position: "bottom-right",
          theme: "colored",
        }
      );
      return;
    }
    if (file_to_upload.size > maxAllowedImageUploadSize) {
      toast.error("File size must be less than 5MB", {
        position: "bottom-right",
        theme: "colored",
      });
      return;
    }
    const objectUrl = URL.createObjectURL(file_to_upload);
    const coverImageToUpload: Partial<AvailableCoverImageInterface> = {
      uri: objectUrl,
      thumb_uri: objectUrl,
      upload: file_to_upload,
    };
    setAvailableCoverImages((previousAvailableCoverImages) => {
      return [...[coverImageToUpload], ...previousAvailableCoverImages];
    });
  }

  const imageOnload = (
    event: React.SyntheticEvent<HTMLImageElement>,
    unique_id: string
  ) => {
    const img = event.currentTarget;
    // Images returned from Open Library that are 'blank' seem to render as 1x1s
    if (img.naturalWidth === 1 || img.naturalHeight === 1) {
      setAvailableCoverImages((previousAvailableCoverImages) => {
        return previousAvailableCoverImages.filter(
          (previousAvailableCoverImage) => {
            return previousAvailableCoverImage.unique_id !== unique_id;
          }
        );
      });
    }
  };

  const toggleBookCoverSelection = (
    event:
      | React.MouseEvent<HTMLImageElement>
      | React.KeyboardEvent<HTMLImageElement>,
    bookCoverImageToSelect: Partial<AvailableCoverImageInterface>
  ) => {
    event.preventDefault();
    // Alert parent component via callback
    onSelectCoverImage(bookCoverImageToSelect);

    const localSelectedCoverImage =
      selectedCoverImage === bookCoverImageToSelect
        ? null
        : bookCoverImageToSelect;
    setSelectedCoverImage(localSelectedCoverImage);
  };

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Row
      style={{
        maxHeight: "500px",
        overflow: "scroll",
        border: "1px solid grey",
        borderRadius: ".375em",
      }}
    >
      <Col className={"m-2"}>
        <input
          type="file"
          id="cover-image-upload"
          onChange={handleSetCoverImageToUpload}
          ref={fileInputRef}
          accept={allowedMimeTypes.join(",")}
          hidden
        />
        <button
          type="button"
          className="btn btn-outline-primary"
          style={{ width: "90px", height: "150px" }}
          onClick={handleButtonToSetCoverImageToUpload}
          aria-label="Add Book to Bookshelf"
        >
          Upload Image
        </button>
      </Col>
      {availableCoverImages.map((availableCoverImage, index) => (
        <Col key={index} className={"m-2"}>
          <img
            src={availableCoverImage.thumb_uri}
            style={{
              height: "150px",
              boxSizing: "border-box",
              padding: "2px",
            }}
            onLoad={(event) =>
              availableCoverImage.unique_id
                ? imageOnload(event, availableCoverImage.unique_id)
                : null
            }
            onClick={(event) =>
              toggleBookCoverSelection(event, availableCoverImage)
            }
            className={`border border-2 ${selectedCoverImage?.unique_id === availableCoverImage?.unique_id ? "border-primary" : "border-light"}`}
            alt={`Available Book Cover ${index.toString()}`}
            loading="lazy"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                toggleBookCoverSelection(event, availableCoverImage);
              }
            }}
            role="presentation"
          />
        </Col>
      ))}
    </Row>
  );
}

export default CoverImage;
