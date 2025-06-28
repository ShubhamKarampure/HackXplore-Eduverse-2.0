# _init__.py
import os
from flask import Flask
from flask_cors import CORS
from server.config import app_config 

def create_app():
    app = Flask(__name__)
    app.config.from_object(app_config) 
    CORS(app)  

    # Import and register blueprints
    from .routes.rag_material_routes import rag_material_bp
    from .routes.module_routes import module_bp
    from .routes.quiz_routes import quiz_bp
    from .routes.assignment_routes import assignment_bp
    from .routes.presentation_routes import presentation_bp

    app.register_blueprint(rag_material_bp, url_prefix='/material') 
    app.register_blueprint(module_bp, url_prefix='/module')     
    app.register_blueprint(quiz_bp, url_prefix='/quiz')        
    app.register_blueprint(assignment_bp, url_prefix='/assignment') 
    app.register_blueprint(presentation_bp, url_prefix='/presentation')        

    return app