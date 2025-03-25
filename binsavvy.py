import os
# Set an environment variable to try to disable Streamlit's file watcher (if supported)
os.environ["DISABLE_STREAMLIT_FILE_WATCHER"] = "1"

import asyncio
# Ensure there's a running event loop (this can help with the 'no running event loop' error)
try:
    asyncio.get_running_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
from collections import Counter
import tempfile

st.set_page_config(page_title="Waste Segmentation & Detection", layout="wide")
st.title("Waste Segmentation & Detection Dashboard")

# Cache the model loading so it's not reloaded on every interaction.
@st.cache_resource
def load_model():
    # Use a raw string for the Windows path.
    model_path = r"C:\Users\lenovo\OneDrive\Documents\Hackathon\Jaipur\BinSavvy\best.pt"
    return YOLO(model_path)

model = load_model()

uploaded_files = st.file_uploader(
    "Upload one or more images", 
    type=["jpg", "jpeg", "png"], 
    accept_multiple_files=True
)

if uploaded_files:
    for uploaded_file in uploaded_files:
        # Convert the uploaded file to an OpenCV image
        file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is None:
            st.error(f"Could not read {uploaded_file.name}.")
            continue

        # Save to a temporary file for inference
        temp_dir = tempfile.TemporaryDirectory()
        temp_path = os.path.join(temp_dir.name, uploaded_file.name)
        cv2.imwrite(temp_path, img)

        st.write(f"Running inference on **{uploaded_file.name}**...")
        results = model.predict(source=temp_path, conf=0.25)
        res = results[0]

        # Generate annotated image (BGR image with predictions)
        annotated_img = res.plot()
        annotated_img = cv2.cvtColor(annotated_img, cv2.COLOR_BGR2RGB)

        # Count objects using class predictions from boxes (since segmentation masks don't provide class info)
        if res.boxes is not None:
            class_ids = res.boxes.cls.tolist()  # List of predicted class indices
            counts = Counter(class_ids)
            total_objects = sum(counts.values())
            st.write(f"Total objects detected: {total_objects}")
            for class_id, count in counts.items():
                # model.names is a dictionary mapping class indices to class names.
                class_name = model.names.get(class_id, f"Class {class_id}")
                percentage = (count / total_objects) * 100
                st.write(f"**{class_name}**: {count} ({percentage:.2f}%)")
        else:
            st.write("No objects detected.")

        st.image(annotated_img, caption=f"Inference result: {uploaded_file.name}", use_container_width=True)
        temp_dir.cleanup()
else:
    st.info("Upload images to see inference results.")
