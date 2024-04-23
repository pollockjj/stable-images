# Arcane Artifex README

Arcane Artifex is a powerful Foundry VTT module that facilitates the creation of visual content directly within your gaming sessions. This module integrates with several AI-powered image generation systems, enabling Game Masters to enhance their storytelling by generating images based on textual prompts provided within the Foundry VTT chat interface.

## Supported Endpoints
### Local Installations with selectable models, schedulers, sampler, and resolutions with optional upscalers and LoRAs (with weights)
- **ComfyUI**: A local installation using Stable Diffusion with custom workflows including face restore, upscaling, animmation, and much more. 
- **Automatic1111**: A Local installation using Stable Diffusion with Face Restore and Creative Upscaling

### Web-Based Image Solutions
- **Stable Horde**: An online service offering cloud-based image generation with SD1.5 and SDXL models and LoRAs
- **Stable Diffusion 3**: An advanced iteration of Stable Diffusion available online that requires a Stability API key for operation.
- **DALL-E 3**: Utilizes OpenAI's DALL-E 3 for generating high-quality images from prompts, accessible online with an API key.

## Setup Instructions for Local Install - Automatic1111 or ComfyUI
Before using Arcane Artifex in your Foundry VTT environment, ensure that your webUI for Stable Diffusion is operational. Follow these steps to prepare the environment:

1. **Start Stable Diffusion with Necessary Flags**:
    For Automatic1111:
    ```
    --listen --api --cors-allow-origins="[your_local_ip_of_foundry]"
    ```
    For ComfyUI, start the service with:
    ```
    python main.py --disable-xformers --enable-cors-header http://localhost:30000 --verbose
    ```

2. **Launching Foundry VTT**:
    Launch your Foundry VTT world where Arcane Artifex is installed, ensuring it can access the machine where Stable Diffusion is running.

## Configuration of Web-Based Image Generation
To use web-based image generation services like Stable Horde, Stable Diffusion 3, or DALL-E 3, follow these setup instructions:

1. **Obtain API Keys**:
    Secure an API key for each service you intend to use. These keys are necessary to access the services and generate images.

2. **Store API Keys Securely**:
    Enter and store the API keys as passwords within Foundry VTT's Game Settings to ensure they are kept secure.

3. **Select Your Service**:
    In the Arcane Artifex settings panel within Foundry VTT, choose the web-based service you wish to use for image generation.

## Generating Images
- **In-Game Image Generation**:
    To generate an image, the Game Master initiates a chat message starting with the trigger `:aa:` followed by the desired prompt. For example:
    ```
    :aa: A majestic castle at sunset
    ```
    The content after the trigger is sent as a prompt to the configured image generation backend.

- **Customizing Prompts**:
    The beginning of the prompt can be customized in the module's settings to include any required prefixes or stylistic choices that influence the generation style.

## Upcoming Features
- **Enhanced UI Integration**: Future updates will include enhanced user interfaces for both local and web-based services, improving the ease of selecting options and viewing generated images.

Ensure that all configurations are correctly set to leverage the full capabilities of Arcane Artifex, enriching your gaming experience with seamlessly integrated visual content generation.
