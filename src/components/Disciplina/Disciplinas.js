/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import DisciplinaForm from './DisciplinaForm';
import app from "../../firebase";
import * as alerts from '../Functions/Alerts';
import Navbar from '../Navbar/index';

const Disciplinas = () => {

    var [disciplinaObjects, setDisciplinaObjects] = useState({})
    var [currentId, setCurrentId] = useState('')

    useEffect(()=>{          
          app.firestore()
            .collection('disciplinas')
            .onSnapshot((querySnapshot) => {
                const results = [];

                querySnapshot.forEach((documentSnapshot) => {
                    results.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id,
                    });
                });

                setDisciplinaObjects(results);
            });
    },[])

    const checkExistence = obj=>{
        try {
            app.firestore().collection('disciplinas')
            .where('nome', '==', obj.nome)
            .get()
            .then(querySnapshot => {
                const result = [];

                querySnapshot.forEach((documentSnapshot) => {
                    result.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id,
                    });
                });

               if(result.length === 0) {
                    addOrEdit(obj);
                } else {
                    alerts.erro('Já existe uma disciplina com este nome!');
                    setCurrentId('');
                }
            });
        } catch(err) {
            alerts.erro(`${err}`);
        }
    }

    const addOrEdit = obj=>{
        if (currentId === '')
        try {
                app.firestore().collection('disciplinas').add(obj)
                .then(() => {
                    setCurrentId('');
                    alerts.sucesso(`Disciplina ${obj.nome} adicionada com sucesso!`);
            });
        }
        catch(err) {
            alerts.erro(`${err}`);
        }
        else
        try {
            app.firestore().collection('disciplinas').doc(disciplinaObjects[currentId].key).update({
                nome: obj.nome,
            })
                .then(() => {
                    setCurrentId('');
                    alerts.sucesso(`Disciplina ${obj.nome} atualizada com sucesso!`);
                });
        }
        catch(err) {
            alerts.erro(`${err}`);
        }        
    }

    const onDelete = key=>{
            try {
                alerts.remover('esta disciplina')
                  .then((willDelete) => {
                    if (willDelete) {
                        app.firestore().collection('disciplinas').doc(disciplinaObjects[key].key).delete()
                        .then(() => {
                            setCurrentId('');
                            alerts.sucesso("Disciplina removida com sucesso!");
                        });
                    } else {
                      alerts.padrao("Operação Cancelada.");
                    }
                  });
               }
            catch(err) {
                   alerts.erro(`${err}`);
            }
    }

    return (
        <>
            <Navbar />
            <div className="jumbotron jumbotron-fluid">
                <div className="container">
                    <h1 className="display-4 text-center">Cadastro de Disciplinas</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-5">
                    <DisciplinaForm {...({ addOrEdit, currentId, disciplinaObjects, checkExistence })} />
                </div>
                <div className="col-md-7">
                    <table className="table table-borderless table-stripped">
                        <thead className="thead-light">
                            <tr>
                                <th>Disciplina</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.keys(disciplinaObjects).map(id => {
                                    return <tr key={id}>
                                        <td style={{color: 'white'}}>{disciplinaObjects[id].nome}</td>
                                        <td>
                                            <button className="btn text-primary" onClick={() => setCurrentId(id)}>
                                                <i className="fas fa-pencil-alt"></i>
                                                <span> Editar</span>
                                            </button>
                                            <button className="btn text-danger" onClick={() => onDelete(id)}>
                                                <i className="fas fa-trash-alt"></i>
                                                <span> Remover</span>
                                            </button>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Disciplinas;
