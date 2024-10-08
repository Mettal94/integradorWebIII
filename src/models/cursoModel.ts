import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, JoinTable,CreateDateColumn,
        UpdateDateColumn, ManyToMany} from "typeorm";

import { Profesor } from './profesorModel';
import { Estudiante } from './estudianteModel';

@Entity('cursos')
export class Curso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column('text')
    descripcion: string;

    @ManyToOne(() => Profesor,profesor => profesor.cursos)
    @JoinColumn({name: 'profesor_id'})
    profesor: Profesor;

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @ManyToMany(() => Estudiante)
    @JoinTable({
        name: 'inscripcion',
        joinColumn: {name: 'curso_id', referencedColumnName: 'id'},
        inverseJoinColumn: {name: 'estudiante_id', referencedColumnName: 'id'}
    })
    estudiantes: Estudiante[];
}