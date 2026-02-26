import asyncio
from dotenv import load_dotenv
load_dotenv()

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import elevenlabs, deepgram, silero
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.agents.llm import LLM, ChatContext, ChatChunk, CompletionUsage
import ai_agent_service

class GraphRAGLLM(LLM):
    def __init__(self):
        super().__init__()

    async def chat(self, chat_ctx: ChatContext, fnc_ctx=None, temperature=None, n=1, parallel_tool_calls=None):
        # 1. Extract user query from chat context
        user_msg = chat_ctx.messages[-1].content
        if isinstance(user_msg, list):
             user_msg = " ".join([m for m in user_msg if isinstance(m, str)])
        
        # 2. Get Response from AI Agent Service (using run_in_executor to avoid blocking)
        from livekit.agents import utils
        response_text = await utils.run_in_executor(ai_agent_service.get_chat_response, str(user_msg))

        # 3. Stream the response back to LiveKit
        async for chunk in self._stream_response(response_text):
            yield chunk

    async def _stream_response(self, text):
        # Simulate streaming by yielding chunks
        chunk_size = 20
        for i in range(0, len(text), chunk_size):
            chunk_content = text[i:i+chunk_size]
            yield ChatChunk(choices=[
                type("Choice", (), {"delta": type("Delta", (), {"content": chunk_content, "tool_calls": None})()})()
            ])
            await asyncio.sleep(0.02) 

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Initial context for the AI
    initial_ctx = ChatContext().append(
        role="system",
        text=(
            "You are the Mechovate Voice Assistant, an elite environmental science agent. "
            "You use Deepgram for ultra-fast speech recognition and Llama 3 for reasoning. "
            "Help users understand environmental data. Be concise, expert, and conversational."
        ),
    )

    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-2-general"), # Using Deepgram Nova-2 for best accuracy/speed
        llm=GraphRAGLLM(), 
        tts=elevenlabs.TTS(),
        chat_ctx=initial_ctx
    )
    
    agent.start(ctx.room)
    
    # Optional greeting
    await agent.say(
        "Welcome to Mechovate. I am your voice-activated environmental guardian. How can I assist with your observations today?", 
        allow_interruptions=True
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
