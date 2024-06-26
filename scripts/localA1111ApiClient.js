import chatListener from "./ChatListener.js";

class LocalA1111APIClient {

async checkStatus() {
        const selectedSource = game.settings.get('arcane-artifex', 'source');
    
        if (selectedSource === 'localA1111') {
            const a1111url = game.settings.get('arcane-artifex', 'localA1111Url');
            const statusUrl = a1111url;
    
            try {
                const response = await fetch(statusUrl, { method: 'HEAD' });
                console.log("response:", response);
                if (response.ok) {
                    console.log('A1111 server is accessible at:', a1111url);
                    ui.notifications.info('A1111 server is accessible.');
                    await game.settings.set("arcane-artifex", "connected", true);
                    await this.getSettings();
                    return 'A1111 API is accessible.';
                } else {
                    console.error('A1111 server is not accessible: response code', response.status, 'at URL:', a1111url);
                    ui.notifications.error(`A1111 server is not accessible: response code: ${response.status}`);
                    await game.settings.set("arcane-artifex", "connected", false);
                    throw new Error(`A1111 API returned an error: ${response.status}`);
                }
            } catch (error) {
                console.error('Error occurred while trying to access A1111 server at URL:', a1111url, '; error =', error);
                ui.notifications.error(`Error occurred while trying to access A1111 server; error = ${error}`);
                await game.settings.set("arcane-artifex", "connected", false);
            }
        } else {
            console.log("Local A1111 is not selected. Skipping A1111 status check.");
            return 'Local A1111 is not selected. Skipping A1111 status check.';
        }
    }
    

    async getSettings() {
        const connection = game.settings.get('arcane-artifex', 'connected');

        if (!connection) {
            console.log("Local A1111 Stable Diffusion connection not established. Skipping API calls.");
            return;
        }
        await this.getA1111EndpointSettings();

        await game.settings.set("arcane-artifex", "localA1111RequestBody",  {
            prompt: game.settings.get("arcane-artifex", "promptPrefix"),
            seed: -1,
            height: game.settings.get("arcane-artifex", "localA1111Height"),
            width: game.settings.get("arcane-artifex", "localA1111Width"),
            negative_prompt: game.settings.get("arcane-artifex", "negativePrompt"),
            n_iter: 1,
            restore_faces: game.settings.get("arcane-artifex", "localA1111RestoreFaces"),
            steps: game.settings.get("arcane-artifex", "localA1111SamplerSteps"),
            sampler_name: game.settings.get("arcane-artifex", "localA1111Sampler"),
            enable_hr: game.settings.get("arcane-artifex", "localA1111EnableHr"),
            hr_upscaler: game.settings.get("arcane-artifex", "localA1111Upscaler"),
            hr_scale: game.settings.get("arcane-artifex", "localA1111HrScale"),
            denoising_strength: game.settings.get("arcane-artifex", "localA1111DenoisingStrength"),
            hr_second_pass_steps: game.settings.get("arcane-artifex", "localA1111HrSecondPassSteps"),
            cfg_scale: game.settings.get("arcane-artifex", "localA1111CfgScale")
        });
        console.log("Default Request Body:", game.settings.get("arcane-artifex", "localA1111RequestBody"));
    }

    async getA1111EndpointSettings() {
        const stIP = await game.settings.get("arcane-artifex", "localA1111Url");
        try {
            const lorasResponse = await fetch(`${stIP}/sdapi/v1/loras`, { method: 'GET' });
            if (lorasResponse.ok) {
                const newLoras = await lorasResponse.json();
                const currentLoras = game.settings.get("arcane-artifex", "localA1111Loras");
                const updatedLoras = currentLoras.map(currentLora => {
                    const matchingNewLora = newLoras.find(newLora => newLora.name === currentLora.name);
                    if (matchingNewLora) {
                        return {
                            ...matchingNewLora,
                            active: currentLora.active || false,
                            strength: currentLora.strength || 0
                        };
                    }
                    return null;
                }).filter(Boolean);
            
                const newLorasToAdd = newLoras.filter(newLora => !currentLoras.some(currentLora => currentLora.name === newLora.name));
                const finalLoras = [...updatedLoras, ...newLorasToAdd];
            
                game.settings.set("arcane-artifex", "localA1111Loras", finalLoras);
            }

            const modelsResponse = await fetch(`${stIP}/sdapi/v1/sd-models`, { method: 'GET' });
            if (modelsResponse.ok) {
                game.settings.set("arcane-artifex", "localA1111Models", await modelsResponse.json());
            }

            const samplersResponse = await fetch(`${stIP}/sdapi/v1/samplers`, { method: 'GET' });
            if (samplersResponse.ok) {
                game.settings.set("arcane-artifex", "localA1111Samplers", await samplersResponse.json());
            }

            const upscalersResponse = await fetch(`${stIP}/sdapi/v1/upscalers`, { method: 'GET' });
            if (upscalersResponse.ok) {
                game.settings.set("arcane-artifex", "localA1111Upscalers", await upscalersResponse.json());
            }

            const optionsResponse = await fetch(`${stIP}/sdapi/v1/options`, { method: 'GET' });
            if (optionsResponse.ok) {
                game.settings.set("arcane-artifex", "localA1111SDOptions", await optionsResponse.json());
            }

        } catch (error) {
            console.error("Error while attempting to access A1111 API endpoints:", error);
        }
    }

  async textToImg(prompt, message) {

    await this.getSettings();

    let requestBody = deepClone(game.settings.get("arcane-artifex", "localA1111RequestBody"));
      requestBody.prompt = this.getFullPrompt(prompt);
      await game.settings.set("arcane-artifex", "fullPrompt", requestBody.prompt)
      let apiUrl = `${game.settings.get("arcane-artifex", "localA1111Url")}/sdapi/v1/txt2img/`;
      await game.settings.set("arcane-artifex", "working", true);
      console.error("Request Body:", requestBody);
   
      try {
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(requestBody)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Error: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            chatListener.createImage(data, prompt, message);
            game.settings.set("arcane-artifex", "working", false);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } catch (e) {
        ui.notifications.warn('Error while sending request to stable diffusion');
        console.error('Catch error:', e);
      }
    }
    
    
  getFullPrompt(userPrompt) {
    return `${game.settings.get("arcane-artifex", "promptPrefix")}${userPrompt}, ${game.settings.get("arcane-artifex", "localA1111LoraPrompt")}`;
}

async initProgressRequest(message, attempt = 0, currentState = "undefined") {
  const maxAttempts = 100;
  if (attempt >= maxAttempts) {
      console.log("arcane-artifex: Max progress check attempts reached, stopping further checks.");
      return;
  }

  if (currentState === "undefined" && attempt === 0) {
      currentState = "idle";
  }

  let apiUrl = `${game.settings.get("arcane-artifex", "localA1111Url")}/sdapi/v1/progress`;
  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error('Request failed with status ' + response.status);
          }
          return response.json();
      })
      .then(async data => {
          chatListener.displayProgress(message, data);

          if ((currentState === "idle" || currentState === "waiting") && data.progress === 0) {
              if (currentState === "idle") {
                  console.log("arcane-artifex: State transition to 'waiting'");
              }
              currentState = "waiting";
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          } else if (currentState === "waiting" && data.progress > 0) {
              currentState = "processing";
              console.log("arcane-artifex: State transition to 'processing'");
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          } else if (currentState === "processing" && data.progress < 1.0) {
              console.log("arcane-artifex: In 'processing' state, progress: " + data.progress + ", attempt: " + attempt);
              setTimeout(() => { this.initProgressRequest(message, attempt + 1, currentState) }, 1500);
          }

          if (currentState === "processing" && (data.progress === 0 || data.progress === 1)) {
              currentState = "done";
              console.log("arcane-artifex: State transition to 'done'");
          }
      })
      .catch(error => {
          console.error('Error fetching progress:', error);
      });
}



}

const localA1111APIClient = new LocalA1111APIClient();

export default localA1111APIClient;
